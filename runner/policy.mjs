// Structural rehearsal policy. Receipts are trusted-operator assertions, not proof
// of external acceptance, sandbox enforcement or semantic coverage.
export const MODES = {
 requirements:['discovery','intake','revise'], branding:['discovery','define','revise','conformance_review'],
 architecture:['profile','compatibility','initial','revise','cross_review'], experience:['compatibility','initial','revise','cross_review'],
 development:['scaffold','implement','repair','integrate','workflow_change'], testing:['scaffold','plan','verify','reverify','readiness','workflow_evaluate'],
 deployment:['prepare_environment','stage_candidate','prepare','release','rehearse','environment_repair','recovery'],
 monitoring:['observe','plan_review','incident','recovery_observe'], retrospective:['review'], coordinator:['coordinate']
};
// These named receipt obligations are checked structurally; their meaning and
// acceptance are verified by the operator against role §3, never inferred here.
export const ENTRY = {
 requirements:{discovery:['source_material'],intake:['authority_request'],revise:['current_requirements','change_evidence']},
 branding:{discovery:['draft_intent'],define:['accepted_requirements','G1'],revise:['accepted_requirements','G1','brand_baseline','change_evidence'],conformance_review:['brand_experience_pair']},
 architecture:{profile:['profile_family','platform_constraints'],compatibility:['draft_intent','profile'],initial:['accepted_requirements','G1'],revise:['accepted_requirements','G1','current_architecture','change_evidence'],cross_review:['accepted_requirements','G1','architecture_experience_pair']},
 experience:{compatibility:['draft_intent','profile'],initial:['accepted_requirements','G1'],revise:['accepted_requirements','G1','current_experience','change_evidence'],cross_review:['accepted_requirements','G1','architecture_experience_pair']},
 development:{scaffold:['accepted_preparation','capability_criteria','rollback_baseline'],implement:['accepted_requirements','joint_G2_pair','accepted_brand','accepted_profile'],repair:['selected_remediation','finding','affected_candidate'],integrate:['accepted_release_scope','joint_G2_pair','slice_packages','integration_plan'],workflow_change:['authorized_proposal','frozen_baseline','evaluation_criteria','rollback_version']},
 testing:{scaffold:['accepted_preparation','baselined_criteria','isolated_setup','scaffold_package'],plan:['accepted_requirements','G1'],verify:['accepted_requirements','joint_G2_pair','accepted_brand','accepted_profile','baselined_test_plan','implementation_package','test_setup'],reverify:['accepted_requirements','joint_G2_pair','accepted_brand','accepted_profile','baselined_test_plan','implementation_package','test_setup','selected_recheck','earlier_findings'],readiness:['release_plan','G3_candidate','isolated_authorization','recovery_criteria','operations_plan'],workflow_evaluate:['authorized_proposal','proposed_package','frozen_baseline','held_out_cases','comparison_criteria']},
 deployment:{prepare_environment:['accepted_setup','environment_authority','versioned_scripts'],stage_candidate:['implementation_package','isolated_target','setup_scripts','staging_authority'],prepare:['accepted_requirements','joint_G2_pair','implementation_package','test_plan'],release:['release_plan','G3_candidate','G4','environment_access'],rehearse:['release_plan','G3_candidate','isolated_authorization'],environment_repair:['fault_evidence','target_configuration','repair_authority','post_repair_checks'],recovery:['incident_or_failed_deployment','deployment_history','recovery_authority']},
 monitoring:{observe:['accepted_requirements','joint_G2_pair','release_plan','deployment_record','window_criteria'],plan_review:['operations_plan','quality_objectives','telemetry_design'],incident:['impact_evidence','release_environment'],recovery_observe:['recovery_record','incident','restoration_criteria']},
 retrospective:{review:['run_evidence','scope_baseline']},coordinator:{coordinate:['authorized_objective','run_policy']}
};
export function need(ok, message) { if (!ok) throw Error(message); }
export function text(v, label) { need(typeof v === 'string' && v.trim().length > 0, `${label} required`); }
export function array(v,label) { need(Array.isArray(v), `${label} must be array`); }
export function names(v,label) { array(v,label); v.forEach(x=>text(x,label)); need(new Set(v).size===v.length, `${label} duplicates`); }
export function receipt(v,label) { need(v && typeof v === 'object',`${label} required`); for(const k of ['operator','evidence_ref'])text(v[k],`${label}.${k}`); }
export function manifestPolicy(m) {
 need(['0.7.1','0.7.2'].includes(m.contract_version),'supported contracts: 0.7.1 or 0.7.2');
 need(m.ledger_schema===2,'ledger_schema must be 2');
 for(const k of ['owner','scope','profile_ref','policy_ref','execution_mode'])text(m[k],k);
 need(['runner','separate_agents','single_model_sequential'].includes(m.execution_mode),'invalid execution_mode');
 need(m.definition_binding?.version===m.contract_version,'definition version mismatch');
 if(m.contract_version==='0.7.1'||m.definition_binding.release_ref!==undefined)need(m.definition_binding.release_ref===`v${m.contract_version}`,'published release binding required');
 else {need(m.definition_binding.status==='unpromoted_candidate','candidate status required'); need(Object.keys(m.definition_binding.file_hashes??{}).length>0,'candidate hashes required');for(const h of Object.values(m.definition_binding.file_hashes))need(/^[a-f0-9]{64}$/.test(h),'invalid candidate hash');}
 names(m.input_refs,'manifest input_refs');
 need(m.accepted_requirements_ref===null || (typeof m.accepted_requirements_ref==='string' && m.accepted_requirements_ref.trim()),'accepted_requirements_ref required');
 for(const k of ['product','workflow_platform','environment','brand'])text(m.authorities?.[k],`authority ${k}`);
 receipt(m.enforcement,'enforcement'); text(m.enforcement.mechanism,'enforcement mechanism');
 for(const k of ['isolation','metering','operational_monitoring','environment_targets','release_policy'])text(m.manual_responsibilities?.[k],`manual responsibility ${k}`);
 const s=m.scope_confirmation; receipt(s,'scope_confirmation');
 for(const k of ['ref','objective','deliverables','completion_criteria','verification_scope','resource_unknowns','stop_conditions'])text(s[k],`scope ${k}`);
 for(const k of ['included','excluded','locations','phases','execution_holds','approved_changes'])names(s[k],`scope ${k}`);
 need(s.locations.length>0 && s.phases.length>0,'scope locations and phases required');
 need(Number.isFinite(s.max_elapsed_ms)&&s.max_elapsed_ms>0 && Number.isFinite(s.max_cost)&&s.max_cost>=0,'scope resource ceilings required');
 need(Number.isSafeInteger(m.concurrency_limit)&&m.concurrency_limit>0,'concurrency_limit required');
}
export function assignmentPolicy(a,m) {
 need(MODES[a.role]?.includes(a.mode),'unsupported role/mode');
 text(a.assignment_ref,'saved assignment_ref'); need(/^[a-f0-9]{64}$/.test(a.assignment_hash),'saved assignment_hash required');
 const s=m.scope_confirmation;
 need(a.scope_confirmation_ref===s.ref,'scope confirmation mismatch');
 need(s.phases.includes(a.action_phase),'action phase outside confirmed scope');
 need(a.write_scope.every(x=>s.locations.includes(x)),'write location outside confirmed scope');
 need(a.limits.max_elapsed_ms<=s.max_elapsed_ms && a.limits.max_cost<=s.max_cost,'assignment exceeds scope limits');
 names(a.execution_holds,'assignment holds');
 const p=a.prerequisites;receipt(p,'prerequisites');need(p.role===a.role&&p.mode===a.mode,'prerequisite role/mode mismatch');
 text(p.contract_section,'prerequisite contract_section');names(p.input_refs,'prerequisite input_refs');
 need(JSON.stringify([...p.input_refs].sort())===JSON.stringify([...new Set([...a.input_refs,...a.baseline_refs])].sort()),'prerequisite input binding mismatch');
 need(p.satisfied===true,'mode prerequisites unsatisfied');array(p.conditions,'mode conditions');need(new Set(p.conditions.map(x=>x.id)).size===p.conditions.length,'duplicate mode condition');for(const id of ENTRY[a.role][a.mode]){const condition=p.conditions.find(x=>x.id===id);need(condition,`mode prerequisite ${id} required`);text(condition.immutable_ref,`mode prerequisite ${id} immutable_ref`);need(/@[^@]+$/.test(condition.immutable_ref),`mode prerequisite ${id} revision required`);text(condition.acceptance_ref,`mode prerequisite ${id} acceptance_ref`);}
 receipt(a.enforcement,'assignment enforcement');text(a.enforcement.mechanism,'enforcement mechanism');
 const r=a.readiness;receipt(r,'readiness');names(r.mandatory_predicates,'mandatory predicates');names(r.selected_checks,'selected checks');array(r.coverage,'coverage');
 need(r.mandatory_predicates.length>0,'mandatory predicates empty');
 need(new Set(r.coverage.map(x=>x.predicate)).size===r.coverage.length,'duplicate predicate coverage');
 need(r.coverage.length===r.mandatory_predicates.length,'coverage must match mandatory predicates');
 for(const c of r.coverage){need(r.mandatory_predicates.includes(c.predicate),'unknown predicate'); if(c.check_id){text(c.capability_ref,'readiness capability');text(c.executor,'readiness executor');text(c.evidence_ref,'readiness capability evidence');need(r.selected_checks.includes(c.check_id)&&a.acceptance_checks.includes(c.check_id),'predicate check not selected');}else{text(c.policy_ref,'exclusion policy');text(c.reason,'exclusion reason');}}
 for(const k of ['subject_ref','configuration_ref','observed_at','method'])text(r[k],`readiness ${k}`);
 names(a.mandatory_self_checks,'mandatory_self_checks');need(a.mandatory_self_checks.length>0,'mandatory self checks empty');
 if(a.mode==='scaffold'){text(a.preparation?.specification_ref,'preparation specification');text(a.preparation?.criteria_ref,'preparation criteria');text(a.preparation?.coordinator_baseline_ref,'preparation baseline'); if(a.role==='testing')text(a.preparation?.implementation_ref,'scaffold implementation');need(a.assessment_scope==='scaffold','scaffold scope required');}
 if(a.role==='development'&&['implement','repair'].includes(a.mode)){text(a.increment?.id,'increment id');text(a.increment?.observable_behavior,'increment behavior');text(a.increment?.checkpoint,'increment checkpoint');names(a.increment?.dependency_refs,'increment dependencies');}
 if(a.mode==='integrate'){text(a.integration?.milestone,'integration milestone');names(a.integration?.increment_refs,'integration increments');need(a.integration.increment_refs.length>0,'integration increments empty');}
 if(a.role==='testing'&&['verify','reverify'].includes(a.mode)){need(['increment','candidate'].includes(a.assessment_scope),'verification assessment_scope required');text(a.subject_ref,'verification subject');text(a.assessment_scope==='increment'?a.increment?.id:a.integration?.milestone,'assessment checkpoint');}
 if(a.mode==='cross_review'||a.mode==='conformance_review'){names(a.review_pair,'review_pair');need(a.review_pair.length===2&&a.review_pair.every(x=>a.input_refs.includes(x)),'exact consumed review pair required');}
}
export function resultPolicy(r,a){
 for(const id of a.mandatory_self_checks){const c=r.checks.find(x=>x.check_id===id);if(r.status==='succeeded')need(c&&['pass','not_applicable'].includes(c.outcome),`mandatory self-check ${id} not passed`);}
 for(const c of a.readiness.coverage)if(c.check_id&&r.status==='succeeded')need(r.checks.some(x=>x.check_id===c.check_id&&x.outcome!=='not_run'),`mandatory predicate ${c.predicate} not assessed`);
 for(const i of r.issues){need(['blocking','major','minor'].includes(i.severity),'issue severity must be blocking, major or minor');text(i.predicate_ref,'issue predicate');text(i.gate_ref,'issue gate');text(i.policy_ref,'issue severity policy');}
 if(a.assessment_scope){need(r.assessment_scope===a.assessment_scope,'result assessment scope mismatch');need(r.subject_ref===(a.subject_ref??a.preparation?.implementation_ref??a.readiness.subject_ref),'result subject mismatch');}
}
