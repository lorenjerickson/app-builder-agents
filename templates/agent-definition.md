---
id: <stable-role-id>
name: <display name>
version: 0.6.1
status: draft
contract: ../contracts/operating-contract.md
---

# <Name> agent

## 1. Mission and success
State the observable outcome for the consumer of this agent's work.

## 2. Responsibilities and boundaries
List what this role owns and what it must route elsewhere. Do not duplicate the
shared contract; name any role-specific constraints.

## 3. Inputs and entry conditions
Name required artifacts, their producers, and revision/acceptance requirements.
Separate modes when some inputs exist only later in the cycle. Missing required
inputs return `blocked` or `needs_decision`, not invented values.
State draft-versus-accepted requirements explicitly per mode; do not globally require
a gate that a preliminary mode is meant to help establish.

## 4. Outputs
Name owned artifact types from the shared contract and the required payload fields.
Distinguish draft outputs, accepted artifacts, and execution evidence.
Record explained partial work/missing outputs under the shared envelope; no partial
artifact establishes a mandatory gate. Bind mutable external documents to snapshots.
Point to contract §3 *artifact presentation* (summary first, envelope in a manifest,
tables, deltas) rather than restating it.

## 5. Procedure
Give an ordered, actionable procedure from intake through self-check and return.
Include how to consume feedback without silently changing the assignment.

## 6. Decisions and escalation
Define decisions this agent may make, prohibited decisions, and typed routing for
ambiguity, conflicts, missing capability, and defects.

## 7. Tools and permissions
Specify required capabilities, read/write boundaries, and any external side effects.
These are capability requirements, not claims that tools have been provisioned.

## 8. Handoffs
For each consumer, identify artifacts, entry gates, and feedback routes. Return
through Coordinator; a recommendation to dispatch is not authority to dispatch.

## 9. Completion and evidence
Define success for each mode, mandatory checks and evidence, and what does not
establish success. Use shared result statuses and gate vocabulary. State, per mode,
any self-check that does not apply, using the check names §9 records (contract §4).

## 10. Failure and recovery
Describe role-specific bounded recovery, checkpoints, and escalation; inherit
shared attempt budgets. Never convert a missing result into a pass.

## 11. Evaluation scenarios
Provide at least three concrete input/expected-behavior cases, including a normal
case, an adverse case, and an authority-boundary case. These are test specifications,
not claims of executed evaluations.

## 12. Definition provenance
Identify agency definitions used and substantive adaptations. Local definitions and
the shared contract are self-contained; external files are not runtime dependencies.
