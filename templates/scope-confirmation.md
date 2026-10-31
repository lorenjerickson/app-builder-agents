# Scope confirmation

Use within the run manifest or link from it and assignments. An explicit bounded
user request can supply confirmation directly; do not ask the user to approve an
identical form. If the request is ambiguous or not tightly scoped, present the
proposed scope and wait for explicit confirmation before substantive execution.

| Field | Record |
|---|---|
| Authority source | User instruction/confirmation reference and date; exact decision versus interpretation |
| Objective | Requested observable outcome |
| Included work / exclusions | Work selected and work expressly outside scope |
| Permitted locations | Repositories, files or bounded areas, systems and environments |
| Allowed phases/actions | Discussion, assessment, planning, implementation, evaluation, publication as authorized |
| Deliverables / completion | What is returned and when the task stops |
| Verification scope | Directly required checks; excluded exercises |
| Resource limits | Agreed time, usage/compute/cost limits; remaining capacity where known; unknowns and labeled estimates |
| Stop conditions / holds | Execution hold, cancellation, resource boundary, or completed deliverable |
| Approved changes | Subsequent explicit decisions; affected scope and resource bounds; superseded interpretation |

An assignment's `scope_confirmation_ref` resolves to this record or the manifest's
field. Delegated tasks add narrower limits without enlarging the parent scope.
Do not include credentials or unrelated private data.

Example: “Update and review these definitions in this repository” permits the named
edits and bounded review. It does not permit an application build, a pilot, external
publication, or other backlog items. “Approve these items; do not start yet” records
approval with an execution hold. “Improve everything” needs a bounded clarification
and confirmation, not an inferred implementation plan.
