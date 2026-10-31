import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { manifestPolicy, assignmentPolicy, resultPolicy, receipt, names, text } from './policy.mjs';

// This ledger records a local, synthetic rehearsal. It never executes role tools.
const SCHEMA = 2;
const ROLES = ['requirements', 'branding', 'architecture', 'experience', 'development',
  'testing', 'deployment', 'monitoring', 'retrospective', 'coordinator'];
const OWNERS = {
  requirements_spec: 'requirements', brand_package: 'branding', architecture_package: 'architecture',
  experience_package: 'experience', implementation_package: 'development', test_plan: 'testing',
  verification_report: 'testing', defect_report: 'testing', release_plan: 'deployment',
  deployment_record: 'deployment', environment_record: 'deployment', operations_plan: 'deployment',
  observation_report: 'monitoring', incident_report: 'monitoring', retrospective_report: 'retrospective',
  change_proposal: 'retrospective', run_manifest: 'coordinator', task_graph: 'coordinator', run_report: 'coordinator',
  decision_request: '*', decision_record: 'coordinator',
};
const RESULT_STATUSES = ['succeeded', 'failed', 'blocked', 'needs_decision'];
const CHECK_OUTCOMES = ['pass', 'fail', 'not_run', 'not_applicable'];
const clone = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const gateHash = gate => hash({ required_checks: gate.required_checks, verdict: gate.verdict,
  checks: gate.checks, artifact_refs: gate.artifact_refs, authority_ref: gate.authority_ref });
const own = (obj, key) => Object.hasOwn(obj, key);
function requireThat(condition, message) { if (!condition) throw new Error(message); }
function object(value, name) {
  requireThat(value !== null && typeof value === 'object' && !Array.isArray(value), `${name} must be an object`);
}
function string(value, name) { requireThat(typeof value === 'string' && value.trim().length > 0, `${name} must be a nonempty string`); }
function list(value, name) { requireThat(Array.isArray(value), `${name} must be an array`); }
function strings(value, name) {
  list(value, name); value.forEach(item => string(item, name));
  requireThat(new Set(value).size === value.length, `${name} contains duplicates`);
}
function fields(value, names, name) {
  object(value, name);
  for (const field of names.split(' ')) requireThat(own(value, field), `${name}.${field} is required`);
}
function positive(value, name) { requireThat(Number.isSafeInteger(value) && value > 0, `${name} must be a positive integer`); }
function checkShape(check) {
  fields(check, 'check_id subject outcome evidence_ref', 'check');
  string(check.check_id, 'check_id'); string(check.subject, 'subject'); string(check.evidence_ref, 'evidence_ref');
  requireThat(CHECK_OUTCOMES.includes(check.outcome), 'invalid check outcome');
  if (check.outcome === 'not_applicable') string(check.policy_ref, 'not_applicable policy_ref');
}
function checkList(checks) {
  list(checks, 'checks'); checks.forEach(checkShape);
  requireThat(new Set(checks.map(check => check.check_id)).size === checks.length, 'duplicate check_id');
}
function emptyState() {
  return { manifest: null, cancelled: false, tasks: {}, artifacts: {}, gates: {}, actions: {},
    work: {}, attempts: [], archived_results: [] };
}

export class Ledger {
  constructor(path) {
    // Inspect existing histories without a write connection or PRAGMA changes.
    if (path !== ':memory:' && existsSync(path)) {
      const probe = new DatabaseSync(path, { readOnly: true });
      try {
        const row = probe.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='state'").get();
        const saved = row && JSON.parse(probe.prepare('SELECT body FROM state WHERE id=1').get()?.body ?? '{}');
        if (saved?.manifest && saved.manifest.ledger_schema !== SCHEMA) { this.db = probe; this.legacy = true; return; }
      } catch (error) { probe.close(); throw error; }
      probe.close();
    }
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK (id=1), body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT NOT NULL, type TEXT NOT NULL, body TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
      CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;`);
    this.db.prepare('INSERT OR IGNORE INTO state (id,body) VALUES (1,?)').run(JSON.stringify(emptyState()));
  }

  close() { this.db.close(); }

  snapshot() {
    this.db.exec('BEGIN');
    try {
      const state = JSON.parse(this.db.prepare('SELECT body FROM state WHERE id=1').get().body);
      state.events = this.db.prepare('SELECT * FROM events ORDER BY seq').all().map(row => ({ ...row, body: JSON.parse(row.body) }));
      this.db.exec('COMMIT');
      return state;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }

  apply(command) {
    requireThat(!this.legacy, 'legacy ledger is read-only; create a new schema-2 ledger, no migration');
    object(command, 'command'); string(command.type, 'type');
    // Serialize at the boundary: caller mutation cannot alter committed state.
    const cmd = clone(command);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const state = JSON.parse(this.db.prepare('SELECT body FROM state WHERE id=1').get().body);
      const result = this.transition(state, cmd);
      this.db.prepare('UPDATE state SET body=? WHERE id=1').run(JSON.stringify(state));
      this.db.prepare('INSERT INTO events (time,type,body) VALUES (?,?,?)')
        .run(new Date().toISOString(), cmd.type, JSON.stringify({ command: cmd, result }));
      this.db.exec('COMMIT');
      return clone(result);
    } catch (error) {
      this.db.exec('ROLLBACK');
      // Rejections are audit events, never partly applied transitions. Do not
      // retain an unvalidated payload (which may contain unsuitable data).
      this.db.prepare('INSERT INTO events (time,type,body) VALUES (?,?,?)').run(
        new Date().toISOString(), 'command_rejected', JSON.stringify({ command_type: cmd.type,
          task_id: typeof cmd.task_id === 'string' ? cmd.task_id : null, error: error.message }));
      throw error;
    }
  }

  task(state, id) {
    string(id, 'task_id'); requireThat(own(state.tasks, id), `unknown task ${id}`); return state.tasks[id];
  }

  artifact(state, ref, { returned = true, allowUnknown = false } = {}) {
    string(ref, 'artifact_ref');
    requireThat(own(state.artifacts, ref), `unknown artifact ${ref}`);
    const artifact = state.artifacts[ref];
    requireThat(allowUnknown || artifact.provenance !== 'unknown', 'unknown provenance is not accepted input');
    requireThat(!artifact.superseded_by && !artifact.invalidated, `stale artifact ${ref}`);
    requireThat(artifact.envelope.completeness === 'complete', `partial artifact ${ref}`);
    if (returned) requireThat(artifact.returned, `unreturned artifact ${ref}`);
    return artifact;
  }

  uncertain(state, task) {
    return task.uncertain || Object.values(state.actions).some(action => action.work_key === task.work_key && action.outcome === 'unknown');
  }

  settleAttempt(state, task, status, progress = false) {
    const attempt = state.attempts.find(item => item.task_id === task.assignment.task_id && item.attempt === task.attempt);
    requireThat(attempt?.status === 'running', 'attempt is not running');
    attempt.status = status; attempt.finished_at = new Date().toISOString();
    task.status = status;
    const work = state.work[task.work_key];
    work.no_progress = progress ? 0 : work.no_progress + 1;
  }

  transition(state, cmd) {
    if (cmd.type === 'init') {
      requireThat(!state.manifest, 'run is already initialized');
      const m = cmd.manifest;
      fields(m, 'run_id objective mode contract_version rehearsal authorization_ref max_attempts gates', 'manifest');
      for (const key of ['run_id', 'objective', 'authorization_ref']) string(m[key], key);
      requireThat(m.mode === 'workflow_evaluation' && m.rehearsal === true, 'only rehearsal workflow_evaluation is supported');
      manifestPolicy(m);
      positive(m.max_attempts, 'max_attempts'); object(m.gates, 'gates');
      for (const [id, checks] of Object.entries(m.gates)) {
        requireThat(/^R[A-Za-z0-9_.-]+$/.test(id), 'only R-prefixed rehearsal gate IDs are supported');
        strings(checks, 'required checks'); requireThat(checks.length > 0, 'gate requires at least one check');
        state.gates[id] = { gate_id: id, required_checks: checks, verdict: 'inconclusive', artifact_refs: [], checks: [] };
      }
      state.manifest = m;
      return { initialized: m.run_id, rehearsal: true };
    }
    requireThat(state.manifest, 'initialize a run first');
    if (cmd.type === 'cancel') {
      string(cmd.reason, 'reason'); state.cancelled = true;
      for (const task of Object.values(state.tasks)) {
        if (task.status === 'running') this.settleAttempt(state, task, 'cancelled');
        else if (['pending', 'ready'].includes(task.status)) task.status = 'cancelled';
      }
      return { cancelled: true, reason: cmd.reason };
    }
    if (cmd.type === 'receipt') return this.recordReceipt(state, cmd);
    if (cmd.type === 'external_baseline') return this.externalBaseline(state, cmd);
    if (cmd.type === 'select_remediation') return this.selectRemediation(state, cmd);
    if (cmd.type === 'assign') return this.assign(state, cmd);
    if (cmd.type === 'dispatch') return this.dispatch(state, cmd);
    if (cmd.type === 'artifact') return this.registerArtifact(state, cmd);
    if (cmd.type === 'result') return this.receiveResult(state, cmd);
    if (cmd.type === 'settle') {
      const task = this.task(state, cmd.task_id);
      requireThat(task.status === 'running' && cmd.attempt === task.attempt, 'settlement must name current running attempt');
      string(cmd.reason, 'reason'); requireThat(typeof cmd.uncertain === 'boolean', 'uncertain must be boolean');
      requireThat(cmd.progress === false, 'runner settlement cannot assert specialist progress');
      if (cmd.uncertain) {
        // A declared uncertain effect must have a durable action identity to reconcile.
        requireThat(Object.values(state.actions).some(action => action.task_id === cmd.task_id && action.attempt === cmd.attempt && action.outcome === 'unknown'), 'uncertain settlement requires a recorded action');
      }
      task.uncertain = cmd.uncertain || this.uncertain(state, task);
      this.settleAttempt(state, task, task.uncertain ? 'blocked' : 'failed');
      return { status: task.status, runner_settlement: true, reason: cmd.reason };
    }
    if (cmd.type === 'action') return this.action(state, cmd);
    if (cmd.type === 'reconcile') {
      string(cmd.action_id, 'action_id'); string(cmd.evidence_ref, 'evidence_ref');
      requireThat(own(state.actions, cmd.action_id), 'unknown action_id');
      requireThat(['applied', 'not_applied', 'unknown'].includes(cmd.outcome), 'invalid reconciliation outcome');
      const action = state.actions[cmd.action_id];
      action.outcome = cmd.outcome; action.evidence_ref = cmd.evidence_ref;
      const task = this.task(state, action.task_id);
      task.uncertain = Object.values(state.actions).some(item => item.work_key === task.work_key && item.outcome === 'unknown');
      return { action_id: cmd.action_id, outcome: action.outcome };
    }
    if (cmd.type === 'gate') return this.gate(state, cmd);
    if (cmd.type === 'supersede') return this.supersede(state, cmd);
    throw new Error(`unknown command ${cmd.type}`);
  }

  assign(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    const a = cmd.assignment;
    fields(a, 'run_id task_id trace_id role mode attempt objective scope baseline_refs input_refs expected_artifact_types dependency_task_ids required_gate_refs allowed_tools write_scope authorization_refs limits acceptance_checks', 'assignment');
    for (const key of ['run_id', 'task_id', 'trace_id', 'role', 'mode', 'objective']) string(a[key], key);
    string(cmd.work_key, 'work_key');
    requireThat(a.run_id === state.manifest.run_id, 'assignment run mismatch');
    requireThat(ROLES.includes(a.role), 'unknown role');
    requireThat(a.attempt === 1, 'new assignment attempt must be 1');
    requireThat(!own(state.tasks, a.task_id), 'duplicate task_id');
    requireThat(a.task_id !== '__proto__' && cmd.work_key !== '__proto__', 'reserved identity');
    for (const key of ['baseline_refs', 'input_refs', 'expected_artifact_types', 'dependency_task_ids', 'required_gate_refs', 'allowed_tools', 'write_scope', 'authorization_refs']) strings(a[key], key);
    requireThat(a.scope !== null && (typeof a.scope === 'string' || Array.isArray(a.scope) || typeof a.scope === 'object'), 'invalid scope');
    requireThat(a.authorization_refs.length > 0, 'assignment requires authorization reference');
    for (const type of a.expected_artifact_types) requireThat(OWNERS[type] === a.role || OWNERS[type] === '*', `role does not own ${type}`);
    for (const ref of [...a.baseline_refs, ...a.input_refs]) this.artifact(state, ref, { allowUnknown: ['discovery','compatibility','workflow_evaluate'].includes(a.mode) });
    for (const id of a.dependency_task_ids) this.task(state, id);
    for (const id of a.required_gate_refs) requireThat(own(state.gates, id), `unknown gate ${id}`);
    if (a.parent_task_id !== undefined) this.task(state, a.parent_task_id);
    fields(a.limits, 'max_elapsed_ms max_cost remaining_task_attempts remaining_run_attempts', 'limits');
    positive(a.limits.max_elapsed_ms, 'max_elapsed_ms');
    requireThat(Number.isFinite(a.limits.max_cost) && a.limits.max_cost >= 0, 'max_cost must be nonnegative');
    positive(a.limits.remaining_task_attempts, 'remaining_task_attempts'); positive(a.limits.remaining_run_attempts, 'remaining_run_attempts');
    strings(a.acceptance_checks, 'acceptance_checks');
    assignmentPolicy(a, state.manifest);
    const { assignment_hash, ...savedAssignment } = a;
    requireThat(assignment_hash === hash(savedAssignment), 'saved assignment hash mismatch');
    // A stable work key is supplied by the operator; also prohibit an exact semantic
    // duplicate under a new key so renaming task IDs cannot reset the obvious case.
    const identity = hash({ role: a.role, mode: a.mode, objective: a.objective, scope: a.scope, baseline_refs: a.baseline_refs, input_refs: a.input_refs });
    for (const existing of Object.values(state.tasks)) {
      requireThat(existing.identity !== identity || existing.work_key === cmd.work_key, 'same work must retain work_key');
      if (existing.work_key === cmd.work_key) requireThat(existing.status !== 'running', 'work already has a running attempt');
    }
    if (!own(state.work, cmd.work_key)) state.work[cmd.work_key] = { attempts: 0, no_progress: 0, output_hashes: [] };
    state.tasks[a.task_id] = { assignment: a, work_key: cmd.work_key, identity, status: 'pending', attempt: 0, uncertain: false, invalidated: false };
    return { task_id: a.task_id, status: 'pending', work_key: cmd.work_key };
  }

  dispatch(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    const task = this.task(state, cmd.task_id); const a = task.assignment; const work = state.work[task.work_key];
    requireThat(['pending', 'ready', 'failed', 'blocked'].includes(task.status), `cannot dispatch ${task.status} task`);
    requireThat(!task.invalidated, 'assignment inputs invalidated; create a revised assignment');
    requireThat(state.manifest.scope_confirmation.execution_holds.length === 0 && a.execution_holds.length === 0, 'execution hold blocks dispatch');
    requireThat(state.attempts.filter(x=>x.status==='running').length < state.manifest.concurrency_limit, 'concurrency limit');
    if (work.attempts > 0 || ['repair','reverify'].includes(a.mode)) {
      const selection = task.selection;
      requireThat(selection && selection.for_attempt === work.attempts + 1, 'remediation selection required for retained lineage');
    }
    requireThat(!this.uncertain(state, task), 'uncertain action requires reconciliation');
    requireThat(!Object.values(state.tasks).some(other => other !== task && other.work_key === task.work_key && other.status === 'running'), 'work already running');
    requireThat(work.attempts < 3, 'three total work attempts exhausted');
    requireThat(work.no_progress < 2, 'two consecutive no-progress attempts exhausted');
    requireThat(state.attempts.length < state.manifest.max_attempts, 'run attempts exhausted');
    requireThat(task.attempt < a.limits.remaining_task_attempts, 'assignment attempts exhausted');
    requireThat(task.attempt < a.limits.remaining_run_attempts, 'assignment run allowance exhausted');
    for (const id of a.dependency_task_ids) requireThat(this.task(state, id).status === 'succeeded' && !this.task(state, id).invalidated, `dependency ${id} not succeeded`);
    for (const id of a.required_gate_refs) requireThat(state.gates[id].verdict === 'pass', `gate ${id} not passed`);
    for (const ref of [...a.baseline_refs, ...a.input_refs]) this.artifact(state, ref, { allowUnknown: ['discovery','compatibility','workflow_evaluate'].includes(a.mode) });
    task.status = 'running'; task.attempt += 1; work.attempts += 1;
    task.dispatched_gate_hashes = Object.fromEntries(a.required_gate_refs.map(id => [id, gateHash(state.gates[id])]));
    state.attempts.push({ task_id: cmd.task_id, work_key: task.work_key, attempt: task.attempt, status: 'running', started_at: new Date().toISOString() });
    return { ...a, attempt: task.attempt, limits: { ...a.limits,
      remaining_task_attempts: Math.min(3 - work.attempts, a.limits.remaining_task_attempts - task.attempt),
      remaining_run_attempts: state.manifest.max_attempts - state.attempts.length } };
  }

  registerArtifact(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    const a = cmd.artifact;
    fields(a, 'artifact_id type revision producer_role run_id task_id input_refs requirement_ids content_ref content_hash completeness missing_fields', 'artifact');
    for (const key of ['artifact_id', 'type', 'producer_role', 'run_id', 'task_id', 'content_ref', 'content_hash']) string(a[key], key);
    requireThat((typeof a.revision === 'string' && a.revision.length > 0) || (Number.isSafeInteger(a.revision) && a.revision > 0), 'invalid revision');
    requireThat(!a.artifact_id.includes('@') && !String(a.revision).includes('@'), 'artifact identity cannot contain @');
    requireThat(a.run_id === state.manifest.run_id, 'artifact run mismatch');
    const task = this.task(state, a.task_id);
    requireThat(task.status === 'running' && !task.invalidated, 'artifact requires current running producer');
    requireThat(cmd.attempt === task.attempt, 'artifact must name current running attempt');
    requireThat(task.assignment.role === a.producer_role, 'artifact producer does not match task role');
    requireThat(OWNERS[a.type] === a.producer_role || OWNERS[a.type] === '*', 'artifact ownership violation');
    requireThat(a.type === 'decision_request' || task.assignment.expected_artifact_types.includes(a.type), 'unexpected artifact type');
    strings(a.input_refs, 'input_refs'); strings(a.requirement_ids, 'requirement_ids'); strings(a.missing_fields, 'missing_fields');
    if (!a.requirement_ids.length) string(a.traceability_reason, 'traceability_reason');
    const expectedInputs = [...new Set([...task.assignment.input_refs, ...task.assignment.baseline_refs])].sort();
    requireThat(JSON.stringify([...a.input_refs].sort()) === JSON.stringify(expectedInputs), 'artifact input_refs mismatch');
    for (const ref of a.input_refs) this.artifact(state, ref, { allowUnknown: ['discovery','compatibility','workflow_evaluate'].includes(task.assignment.mode) });
    requireThat(['complete', 'partial'].includes(a.completeness), 'invalid completeness');
    requireThat(a.completeness === 'partial' ? a.missing_fields.length > 0 : a.missing_fields.length === 0, 'completeness and missing_fields disagree');
    requireThat(own(cmd, 'payload') && cmd.payload !== null && typeof cmd.payload === 'object', 'artifact payload must be an object or array');
    requireThat(a.content_hash === hash(cmd.payload), 'artifact content_hash mismatch');
    if(a.type==='decision_record') {
      const p=cmd.payload;
      for(const k of ['question','decision','interpretation','authority','date','source']) string(p[k], `decision ${k}`);
      strings(p.binding_on,'decision binding_on'); requireThat(p.binding_on.length>0&&p.binding_on.every(x=>ROLES.includes(x)), 'invalid binding roles');
      strings(p.affected_artifacts,'affected_artifacts'); list(p.required_revisions,'required_revisions');
      requireThat(p.required_revisions.length>0,'required revisions or explicit none required');
      for(const item of p.required_revisions) {
        if(item.artifact==='none')string(item.reason,'no revision reason');
        else {string(item.artifact,'revision artifact');requireThat(ROLES.includes(item.role),'revision role');string(item.task_ref,'revision task');requireThat(['proposed','selected','complete','deferred'].includes(item.disposition),'revision disposition');}
      }
      requireThat(p.supersedes===null||typeof p.supersedes==='string','decision supersedes required');
    }
    const ref = `${a.artifact_id}@${a.revision}`;
    requireThat(!own(state.artifacts, ref), 'immutable artifact revision already exists');
    state.artifacts[ref] = { envelope: a, payload: cmd.payload, attempt: task.attempt, returned: false, accepted_by: [], invalidated: false, superseded_by: null };
    return { artifact_ref: ref, content_hash: a.content_hash };
  }

  receiveResult(state, cmd) {
    const r = cmd.result;
    object(r, 'result');
    const task = this.task(state, r.task_id);
    // Identity is inspected before payload schema so stale malformed replies cannot
    // settle a current attempt. Keep these historical without advancing any state.
    const inputsChanged = task.assignment.required_gate_refs.some(id => state.gates[id].verdict !== 'pass' || task.dispatched_gate_hashes?.[id] !== gateHash(state.gates[id])) ||
      task.assignment.dependency_task_ids.some(id => state.tasks[id].status !== 'succeeded' || state.tasks[id].invalidated);
    const stale = state.cancelled || task.status !== 'running' || task.invalidated || inputsChanged || r.attempt !== task.attempt ||
      r.run_id !== state.manifest.run_id || r.trace_id !== task.assignment.trace_id || r.role !== task.assignment.role;
    if (stale) {
      if (inputsChanged && task.status === 'running' && r.attempt === task.attempt) this.settleAttempt(state, task, 'blocked');
      state.archived_results.push({ result: r, reason: 'stale_or_unauthorized_attempt' });
      return { archived: true, reason: 'stale_or_unauthorized_attempt' };
    }
    try {
      fields(r, 'run_id task_id trace_id role attempt consumed_refs status summary output_refs checks issues next_route usage checkpoint_ref missing_outputs', 'result');
      strings(r.consumed_refs, 'consumed_refs'); strings(r.output_refs, 'output_refs');
      requireThat(RESULT_STATUSES.includes(r.status), 'invalid result status');
      string(r.summary, 'summary'); checkList(r.checks); list(r.issues, 'issues'); list(r.missing_outputs, 'missing_outputs');
      requireThat(r.next_route === null || typeof r.next_route === 'string' || (r.next_route !== null && typeof r.next_route === 'object'), 'invalid next_route');
      if (r.checkpoint_ref !== null) string(r.checkpoint_ref, 'checkpoint_ref');
      object(r.usage, 'usage');
      requireThat(Object.keys(r.usage).length > 0, 'usage requires actual measurements or null with reason');
      if (Object.values(r.usage).some(value => value === null)) string(r.usage.reason, 'usage.reason');
      for (const [key, value] of Object.entries(r.usage)) if (key !== 'reason') requireThat(value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0), 'usage measurements must be nonnegative or null');
      for (const issue of r.issues) {
        fields(issue, 'category impact evidence', 'issue');
        for (const key of ['category', 'impact', 'evidence']) string(issue[key], `issue.${key}`);
        requireThat(typeof issue.owner === 'string' || typeof issue.proposed_route === 'string', 'issue requires owner or proposed_route');
      }
      const expectedInputs = [...new Set([...task.assignment.input_refs, ...task.assignment.baseline_refs])].sort();
      requireThat(JSON.stringify([...r.consumed_refs].sort()) === JSON.stringify(expectedInputs), 'consumed_refs do not match assignment');
      for (const ref of r.consumed_refs) this.artifact(state, ref, { allowUnknown: ['discovery','compatibility','workflow_evaluate'].includes(task.assignment.mode) });
      const outputTypes = [];
      for (const ref of r.output_refs) {
        requireThat(own(state.artifacts, ref), `unknown output ${ref}`);
        const output = state.artifacts[ref];
        requireThat(!output.invalidated && !output.superseded_by, 'stale output');
        requireThat(output.envelope.task_id === r.task_id && output.attempt === r.attempt && output.envelope.producer_role === r.role, 'output not owned by current attempt');
        if (r.status === 'succeeded') requireThat(output.envelope.completeness === 'complete', 'successful output must be complete');
        outputTypes.push(output.envelope.type);
      }
      for (const missing of r.missing_outputs) {
        fields(missing, 'type reason next_action', 'missing_output');
        for (const key of ['type', 'reason', 'next_action']) string(missing[key], `missing_output.${key}`);
        requireThat(task.assignment.expected_artifact_types.includes(missing.type), 'unexpected missing output type');
      }
      for (const type of task.assignment.expected_artifact_types) requireThat(outputTypes.includes(type) || (r.status !== 'succeeded' && r.missing_outputs.some(item => item.type === type)), `missing expected output ${type}`);
      if (r.status === 'succeeded') {
        requireThat(r.missing_outputs.length === 0, 'success cannot have missing outputs');
        for (const id of task.assignment.acceptance_checks) requireThat(r.checks.some(check => check.check_id === id && check.outcome !== 'not_run'), `success missing check ${id}`);
      }
      if (r.status === 'needs_decision') requireThat(outputTypes.includes('decision_request'), 'needs_decision requires decision_request');
      resultPolicy(r, task.assignment);
      requireThat(!this.uncertain(state, task), 'result cannot settle uncertain external action before reconciliation');
    } catch (error) {
      state.archived_results.push({ result: r, reason: 'malformed', error: error.message });
      this.settleAttempt(state, task, this.uncertain(state, task) ? 'blocked' : 'failed');
      return { rejected: true, error: error.message, status: task.status };
    }
    for (const ref of r.output_refs) state.artifacts[ref].returned = true;
    task.result = r;
    // New, complete immutable outputs constitute observable progress; merely
    // repeating a failed report without outputs does not reset the stop counter.
    const work = state.work[task.work_key];
    work.output_hashes ??= [];
    const newHashes = r.output_refs.filter(ref => state.artifacts[ref].envelope.completeness === 'complete')
      .map(ref => state.artifacts[ref].envelope.content_hash);
    const progress = r.status === 'succeeded' || newHashes.some(value => !work.output_hashes.includes(value));
    work.output_hashes = [...new Set([...work.output_hashes, ...newHashes])];
    this.settleAttempt(state, task, r.status, progress);
    return { status: task.status, accepted_result: true };
  }

  selectRemediation(state, cmd) {
    requireThat(!state.cancelled,'run is cancelled');
    const task=this.task(state,cmd.task_id), work=state.work[task.work_key];
    requireThat(task.status!=='running','cannot select running work');
    receipt(cmd.selection,'remediation selection');
    for(const k of ['authority_ref','finding_ref','scope','recheck_scope'])string(cmd.selection[k],k);
    const prior=state.attempts.find(x=>x.task_id===cmd.selection.original_task_id&&x.attempt===cmd.selection.original_attempt&&x.work_key===task.work_key&&x.status!=='running');
    requireThat(prior,'selection must retain original settled work lineage');
    requireThat(cmd.selection.for_attempt===work.attempts+1,'selection attempt mismatch');
    task.selection=cmd.selection;
    return { selected:task.assignment.task_id, for_attempt:cmd.selection.for_attempt };
  }

  externalBaseline(state, cmd) {
    requireThat(!state.cancelled,'run is cancelled');
    string(cmd.ref,'external ref');requireThat(/^[^@]+@[^@]+$/.test(cmd.ref),'external immutable revision required');
    receipt(cmd.receipt,'ingestion receipt');
    requireThat(!own(state.artifacts,cmd.ref),'immutable artifact revision already exists');
    requireThat(cmd.payload!==undefined&&cmd.content_hash===hash(cmd.payload),'external hash mismatch');
    const [artifact_id,revision]=cmd.ref.split('@');
    state.artifacts[cmd.ref]={envelope:{artifact_id,revision,type:'external_baseline',producer_role:null,task_id:null,input_refs:[],completeness:'complete',content_hash:cmd.content_hash},
      payload:cmd.payload,provenance:'unknown',ingestion:cmd.receipt,returned:true,accepted_by:[],invalidated:false,superseded_by:null};
    return { artifact_ref:cmd.ref,provenance:'unknown' };
  }

  recordReceipt(state, cmd) {
    requireThat(!state.cancelled,'run is cancelled');
    receipt(cmd.receipt,'receipt');string(cmd.id,'receipt id');requireThat(cmd.id !== '__proto__','reserved receipt identity');
    state.receipts??={};requireThat(!own(state.receipts,cmd.id),'immutable receipt id');
    const r=cmd.receipt;
    requireThat(['external_acceptance','placement','observation','decision_propagation','dependency_coverage'].includes(r.kind),'unsupported receipt kind');
    const artifact=this.artifact(state,r.artifact_ref,{allowUnknown:true});
    if(r.kind==='external_acceptance') {requireThat(artifact.envelope.type==='external_baseline','not external baseline');string(r.authority_ref,'external authority');artifact.provenance='authority_accepted';}
    if(r.kind==='placement') {for(const k of ['requested_location','actual_location','reason'])string(r[k],k); requireThat(r.content_hash===artifact.envelope.content_hash,'placement must preserve producer hash');}
    if(r.kind==='observation')for(const k of ['observed_at','configuration_ref','subject_ref','method','result'])string(r[k],k);
    if(r.kind==='decision_propagation') {requireThat(artifact.envelope.type==='decision_record','not decision record');strings(r.roles,'propagated roles');requireThat(artifact.payload.binding_on.every(x=>r.roles.includes(x)),'missing binding role');strings(r.reconciled_revision_refs,'reconciled revisions');for(const ref of r.reconciled_revision_refs)this.artifact(state,ref);}
    if(r.kind==='dependency_coverage') {strings(r.changed_guarantees,'changed guarantees');strings(r.dependency_refs,'dependency refs');for(const ref of r.dependency_refs)this.artifact(state,ref);string(r.recheck_scope,'bounded recheck scope');string(r.consequence_sweep,'consequence sweep');}
    state.receipts[cmd.id]=r;return {recorded:cmd.id};
  }

  action(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    for (const key of ['action_id', 'idempotency_key', 'target', 'baseline_ref', 'checkpoint_ref']) string(cmd[key], key);
    const task = this.task(state, cmd.task_id);
    requireThat(task.status === 'running' && cmd.attempt === task.attempt && !task.invalidated, 'action requires current running attempt');
    const intent = { task_id: cmd.task_id, attempt: cmd.attempt, action_id: cmd.action_id, idempotency_key: cmd.idempotency_key,
      target: cmd.target, baseline_ref: cmd.baseline_ref, checkpoint_ref: cmd.checkpoint_ref };
    if (own(state.actions, cmd.action_id)) {
      const existing = state.actions[cmd.action_id];
      requireThat(JSON.stringify(existing.intent) === JSON.stringify(intent), 'action_id reused with different intent');
      return { action_id: cmd.action_id, duplicate: true, outcome: existing.outcome };
    }
    requireThat(cmd.action_id !== '__proto__', 'reserved action identity');
    requireThat(!Object.values(state.actions).some(action => action.intent.idempotency_key === cmd.idempotency_key), 'idempotency_key already recorded');
    state.actions[cmd.action_id] = { ...intent, intent, work_key: task.work_key, outcome: 'unknown', evidence_ref: null };
    return { action_id: cmd.action_id, outcome: 'unknown', intent_only: true };
  }

  gate(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    requireThat(own(state.gates, cmd.gate_id), 'unknown rehearsal gate');
    checkList(cmd.checks); strings(cmd.artifact_refs, 'artifact_refs'); string(cmd.authority_ref, 'authority_ref');
    requireThat(cmd.artifact_refs.length > 0, 'gate requires returned artifact evidence');
    for (const ref of cmd.artifact_refs) this.artifact(state, ref);
    const gate = state.gates[cmd.gate_id];
    const required = gate.required_checks.map(id => cmd.checks.find(check => check.check_id === id));
    const verdict = required.some(check => check?.outcome === 'fail') ? 'fail'
      : required.some(check => !check || check.outcome === 'not_run') ? 'inconclusive' : 'pass';
    const changed = gate.verdict === 'pass' && hash({ checks: gate.checks, artifact_refs: gate.artifact_refs, authority_ref: gate.authority_ref }) !==
      hash({ checks: cmd.checks, artifact_refs: cmd.artifact_refs, authority_ref: cmd.authority_ref });
    for (const artifact of Object.values(state.artifacts)) artifact.accepted_by = artifact.accepted_by.filter(id => id !== cmd.gate_id);
    Object.assign(gate, { verdict, checks: cmd.checks, artifact_refs: cmd.artifact_refs, authority_ref: cmd.authority_ref, invalidated: false, evaluated_at: new Date().toISOString() });
    if (verdict === 'pass') for (const ref of cmd.artifact_refs) state.artifacts[ref].accepted_by.push(cmd.gate_id);
    if (changed) this.invalidateTasks(state, Object.keys(state.tasks).filter(id => state.tasks[id].assignment.required_gate_refs.includes(cmd.gate_id)));
    return { gate_id: cmd.gate_id, verdict: gate.verdict };
  }

  invalidateTasks(state, seeds) {
    const ids = new Set(seeds); const refs = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const [ref, artifact] of Object.entries(state.artifacts)) {
        if (!refs.has(ref) && (ids.has(artifact.envelope.task_id) || artifact.envelope.input_refs.some(input => refs.has(input)))) {
          refs.add(ref); artifact.invalidated = true; artifact.accepted_by = []; changed = true;
        }
      }
      for (const [id, task] of Object.entries(state.tasks)) {
        if (!ids.has(id) && (task.assignment.dependency_task_ids.some(dep => ids.has(dep)) || [...task.assignment.input_refs, ...task.assignment.baseline_refs].some(ref => refs.has(ref)))) {
          ids.add(id); changed = true;
        }
      }
      for (const gate of Object.values(state.gates)) {
        if (gate.artifact_refs.some(ref => refs.has(ref))) {
          gate.verdict = 'inconclusive'; gate.invalidated = true;
          for (const [id, task] of Object.entries(state.tasks)) {
            if (!ids.has(id) && task.assignment.required_gate_refs.includes(gate.gate_id)) { ids.add(id); changed = true; }
          }
        }
      }
    }
    for (const id of ids) {
      const task = state.tasks[id]; task.invalidated = true;
      if (task.status === 'running') this.settleAttempt(state, task, 'blocked'); else task.status = 'blocked';
    }
    for (const artifact of Object.values(state.artifacts)) artifact.accepted_by = artifact.accepted_by.filter(id => state.gates[id].verdict === 'pass');
  }

  supersede(state, cmd) {
    requireThat(!state.cancelled, 'run is cancelled');
    const old = this.artifact(state, cmd.artifact_ref); const replacement = this.artifact(state, cmd.new_ref);
    requireThat(cmd.artifact_ref !== cmd.new_ref, 'cannot supersede itself');
    requireThat(old.envelope.artifact_id === replacement.envelope.artifact_id && old.envelope.type === replacement.envelope.type && old.envelope.producer_role === replacement.envelope.producer_role, 'replacement must preserve artifact identity/type/owner');
    old.superseded_by = cmd.new_ref;
    const invalidRefs = new Set([cmd.artifact_ref]); const invalidTasks = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const [ref, artifact] of Object.entries(state.artifacts)) {
        if (ref !== cmd.new_ref && !invalidRefs.has(ref) && (artifact.envelope.input_refs.some(input => invalidRefs.has(input)) || invalidTasks.has(artifact.envelope.task_id))) {
          artifact.invalidated = true; invalidRefs.add(ref); changed = true;
        }
      }
      for (const [id, task] of Object.entries(state.tasks)) {
        if (!invalidTasks.has(id) && ([...task.assignment.input_refs, ...task.assignment.baseline_refs].some(ref => invalidRefs.has(ref)) || task.assignment.dependency_task_ids.some(dep => invalidTasks.has(dep)))) {
          invalidTasks.add(id); task.invalidated = true; changed = true;
          if (task.status === 'running') this.settleAttempt(state, task, 'blocked'); else task.status = 'blocked';
        }
      }
    }
    // Rehearsal conservatively invalidates every gate; no production semantic
    // dependency inference or compatibility proof is claimed by this adapter.
    for (const gate of Object.values(state.gates)) { gate.verdict = 'inconclusive'; gate.invalidated = true; }
    // Conservative gate invalidation must also invalidate completed consumers:
    // their outputs cannot remain current merely because their dependency was
    // expressed as a gate reference instead of a direct artifact reference.
    this.invalidateTasks(state, Object.keys(state.tasks).filter(id =>
      state.tasks[id].assignment.required_gate_refs.length > 0));
    for (const [id, task] of Object.entries(state.tasks)) if (task.invalidated) invalidTasks.add(id);
    for (const [ref, artifact] of Object.entries(state.artifacts)) {
      artifact.accepted_by = [];
      if (artifact.invalidated) invalidRefs.add(ref);
    }
    return { superseded: cmd.artifact_ref, replacement: cmd.new_ref, invalidated_tasks: [...invalidTasks], invalidated_artifacts: [...invalidRefs] };
  }
}
