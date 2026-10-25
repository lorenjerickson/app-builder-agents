---
artifact_id: EXP-EVAL-050-01-PRELIM
type: experience_package           # preliminary, compatibility mode: text interaction model only
revision: r1 (draft)
status: draft                      # preliminary; cannot satisfy G2E or G2; does not authorize implementation
mode: compatibility
completeness: partial
missing_fields:
  - brand_application (no brand_package or brand authority acceptance exists; G2B absent) - see XDR-09
  - visual_direction values, token values, component visuals (depend on accepted brand)
  - visual_baseline (no Figma document assigned; no wireframes or snapshots; not required in compatibility mode, required for G2E)
  - asset manifest entries (no assets specified beyond needs; producers unassigned)
  - interaction_operation_map bound to an architecture revision (no architecture_package draft available; all OP-* are proposed needs)
  - full journey state tables for P2/P3/L use cases (outlined only; scope pending DR-01)
  - accessibility conformance target (QT-06 unresolved; XDR-06)
  - approved thresholds for user-outcome signals (QT-07, QT-08 unresolved; DR-08)
producer_role: experience
run_id: EVAL-050-01
task_id: E1
attempt: 1
execution_mode: separate_agents
input_refs:
  - ref: /home/claude/eval05/req/personas.md (REQ-EVAL-050-01-ACTORS r1, draft, not G1)
    sha256_file: c040fd1fd0145f2a11599c7265dc8ea41ec628cb236892199bc9cc9b67949989
    content_hash_verified: sha256:c0346197991a3d8c0b25371097f276c6f51b6e390be0a7467a964736a47fc21f (matches declared)
  - ref: /home/claude/eval05/req/use-cases.md (REQ-EVAL-050-01-USECASES r1, draft, not G1)
    sha256_file: 8a5c9201c4e0f4effe557d5109e166141e079df3b1648e41adff8b1ebf76c822
    content_hash_verified: sha256:ac47b3de949cb883062a026723dc01c8cf6107d0296c32ad0c3f44db2fdac91f (matches declared)
  - ref: meta-agents/contracts/operating-contract.md (v0.5.0)
    sha256: 30b0409148efff46116c5ecc49cebbd4be5460533d2f5863fea9f410ae6e766e
  - ref: meta-agents/contracts/platform-profile.md (web-app-v1 0.5.0)
    sha256: 9169173af6eab0dcd58cf718bb0b5eeee82b0a59d02f553a4d1aface1e46dd7e
  - ref: meta-agents/agents/experience.md (v0.5.0)
    sha256: fa46c3cc88c2e06f0181efa63a5e571fd8e0c69a28c35c1f7d256827da34a25c
  - absent: run_manifest (not supplied to this task), architecture_package (none drafted), brand_package (none), Figma assignment (none), design-system constraints (none)
requirement_ids: []
traceability_reason: >-
  Pre-G1 compatibility assessment. No accepted requirement IDs exist. Every screen,
  journey, pattern and operation need below traces to the provisional candidate IDs
  in the Requirements discovery drafts (UC-*, AS-*, CCR-*, DC-*, QT-*, CT-*, DR-*,
  ACT-*, SOD-*, CAP-*, PF-*). Mapping must be re-established against the accepted
  revision at intake/G1.
content_ref: /home/claude/eval05/exp/interface-specification.md (body from the BODY-START marker line to end of file)
content_hash: sha256:12ebe03cc74e4342e884a3704bc077be53ab8a920a79ccfbbf184d3b4af24df3
created: 2026-10-25
---
<!-- BODY-START -->

# Rental property office - preliminary interaction model (compatibility mode)

## 0. Status, scope and how to read this

**What this is.** A bounded, preliminary `experience_package` in `compatibility` mode
(experience definition §3): a *text interaction model* derived from unaccepted
Requirements drafts. **It is not a visual baseline, is not G2E-eligible, cannot
contribute to G2, and does not authorize implementation.** No Figma document was
assigned, no wireframes were produced, and no brand exists, so no visual quality,
brand conformance or usability claim is made. Package specifications are not executed
usability tests (definition §4).

**Scope depth.** DR-01 (first product scope) is open. This model follows the
Requirements recommendation only as a *working assumption* for depth, not as a
decision:

- **Full depth** (journey state tables, operation needs, disclosure rules): Option A
  operations core - UC-01, UC-02, UC-09 (referral and arrangement record only),
  UC-11 (condition record, keys, channels), UC-15, UC-16, UC-19, UC-27, UC-29
  (access control), UC-33 (possession basis), UC-35.
- **Outline depth** (workspace placement, screen inventory, key states and risks):
  all other UCs (P2, P3, L). If authority selects Option B, C or D, those journeys
  need full state tables in a later revision.

**Source tags** (contract §3). Experience did not read the narrative; its only product
sources are the two Requirements drafts. Tags therefore mean:

- `[D]` derived from a cited draft requirement (CCR/AS/DC/ACT/...); inherits that
  requirement's unaccepted status.
- `[P]` Experience proposal (presentation or interaction choice, or a proposed
  operation need) awaiting decision/acceptance.
- `[K]` external domain knowledge (e.g. accessibility standards); needs the named
  reviewer before it binds. Never used as a business rule here.
- `[A]` none: no authority decisions exist in run EVAL-050-01.
- `[S]` not used: Experience had no direct stated source.

**ID conventions used here** (all provisional): `WS-` workspace, `S-` screen,
`J-` journey, `IX-` interaction, `OP-` proposed operation need, `PAT-` shared pattern,
`DS-` disclosure rule, `UOS-` user-outcome signal need, `XDR-` Experience decision
request, `XR-` risk, `XI-` issue routed to another owner.

---

## 1. Surfaces, workspaces and navigation

### 1.1 Platform fit assumptions `[D]` platform-profile

- Authenticated browser UI only; responsive; no native mobile client, no offline
  mode, no public anonymous surface (PF-2 stays out unless Architecture/authority
  changes it).
- Staff-only users in the first scope, following DR-03 recommendation (a) `[P]`;
  vendor/counsel item-scoped external views are specified as outline only (DR-03 (d)).
- Residents without a portal (PF-6) are served by staff entering records "on behalf
  of" with the channel recorded (PAT-11).

### 1.2 Global chrome (present on every staff screen) `[P]`

| Element | Behaviour | Source |
|---|---|---|
| Property scope selector | Shows the current property (or "All my properties" when the user is assigned more than one). Lists, counts, search and notifications reflect only selected scope ∩ assigned scope. Changing scope with unsaved data triggers PAT-07. Every row in a multi-property view shows its property. | CCR-25, AS-01-05 [D] |
| Capacity indicator / selector | Shows the capacity in use (e.g. "Acting as: Maintenance lead"). Users holding one capacity see a static label. Users holding several select one; permissions are never merged. Switching capacity reloads the workspace under the new capacity. Consequential actions show the capacity in their confirmation. | CAP-1, CCR-32 [D]; PAT-10 [P] |
| Coverage banner | When the capacity is temporary coverage, shows "Coverage until <date/time>". At expiry the session loses that capacity at the next request; unsaved work is preserved locally (PAT-07) and the user is told why the action is no longer available. | CAP-2 [D] |
| Acting-for banner | When recording an instruction from a representative, a persistent banner "Recording for <resident> on instruction of <representative>, scope <scope>, valid until <date>" stays visible until the user ends it. | ACT-REP, CCR-32 [D] |
| Scoped search | Searches only records the user may view in the current capacity and scope; restricted categories never appear as hits or suggestions (DS-02). | ACTORS §3.2, CCR-09 [D] |
| Notification tray | Minimal-content notices only (DS-07); opening one routes through normal authorization. | ACTORS §3.2 [D] |
| Help / "why" link | Every denied or blocked state links to a plain-language reason (PAT-04). | contract §3 behavioural policies [D] |
| Service status | Shows degraded/unavailable state (J-15). | QT-05 [D] |

### 1.3 Workspaces

| ID | Workspace | Primary actors (capacity) | Contents | Depth |
|---|---|---|---|---|
| WS-1 | Today (handoff) | ACT-PM, all staff, ACT-AHS | Daily handoff list, my matters, unowned/overdue, end-of-shift entry, compliance due items (UC-38 outline) | Full |
| WS-2 | Homes and spaces | ACT-PM, ACT-MNL, ACT-LEA, ACT-RSS | Inventory tree, home detail, readiness checklist, availability dates, move-in, move-out/possession, turnover; spaces (parking/storage/amenity outline) | Full (UC-02, 11, 33, 35); outline (UC-25, 26) |
| WS-3 | Work | ACT-MNL, ACT-TEC, ACT-PM, ACT-RSS, ACT-AHS | Repair intake, triage board, work order detail, entry scheduling, dispatch, vendors (outline), preventive/capital (outline), purchasing (outline) | Full (UC-15, 16, 19); outline (UC-17, 18, 20) |
| WS-4 | Households and people | ACT-RSS, ACT-LEA, ACT-PM | Household detail, party roles, communication channels, keys/credentials, condition records, service requests (outline), complaints (outline), disclosure verification | Full (UC-11 parts, 27, 29); outline (UC-12, 13, 14) |
| WS-5 | Accommodations (restricted) | ACT-ACR only | Request queue, request detail with supporting information, arrangement authoring/publication | Full for referral + arrangement record; decision workflow outline (L) |
| WS-6 | Leasing | ACT-LEA, ACT-PM | Offers, listings, inquiries/tours, waiting list, applications, screening, leases | Outline (UC-03-08, 10) |
| WS-7 | Money | ACT-ACC, ACT-PM, ACT-OWN | Ledger, reconciliation, missed payments, owner reports | Outline (UC-21-24, 34); blocked on DR-04 |
| WS-8 | Oversight and administration | ACT-PM (admin capacity), ACT-OWN (reports) | Users/capacities/coverage, policy versions (CCR-07), audit log, oversight review (UC-36), legal hold (UC-29), transfer export (UC-39) | Full for policy-version gating and user/capacity admin needed by P1; outline otherwise |
| WS-9 | My jobs (narrow) | ACT-TEC (and ACT-MNL in technician capacity) | Assigned work orders only, arrangement to honour, access arrangement, hazards, status/labour/materials/photos | Full |
| WS-10 | External job view | ACT-VEN (invited, item-scoped) | One job: scope, access arrangement, arrangement to honour, status/evidence, invoice (outline) | Outline (pending DR-03 (d)) |

Navigation `[P]`: wide viewports use a persistent left navigation listing only the
workspaces the current capacity may enter (WS-5 is not listed, not shown disabled,
for capacities without access - DS-04). Narrow viewports use a top bar with a menu
button; ACT-TEC lands directly in WS-9. Breadcrumbs follow property → building →
home → record and obey DS-03. Deep links to a record outside scope or permission
resolve to PAT-04 "not available" without confirming existence (XDR-08).

---

## 2. Screen inventory (traced)

Priority and depth follow the Requirements draft (§4 priority codes). "Full" screens
have journey tables in §3.

| ID | Screen | WS | Actors | Traces to | Prio | Depth |
|---|---|---|---|---|---|---|
| S-01 | Daily handoff list | 1 | PM, all staff, AHS | UC-01, AS-01-01/03/05, CCR-11, CCR-25 | P1 | Full |
| S-02 | Matter detail (generic shell: owner, due, history, promises) | 1 | all staff | UC-01, AS-01-02, DC-32 | P1 | Full |
| S-03 | End-of-shift handoff entry | 1 | all staff, AHS | AS-01-02, DC-32 | P1 | Full |
| S-04 | Inventory tree (property/building/home/space) | 2 | PM, MNL, LEA, RSS | UC-02, DC-01-03 | P1 | Full |
| S-05 | Home detail (status, anticipated vs confirmed dates, readiness summary) | 2 | PM, MNL, LEA, RSS | UC-02, AS-02-01, CCR-05, CCR-06 | P1 | Full |
| S-06 | Readiness checklist | 2 | MNL, PM | AS-02-02/03/05, DC-02 | P1 | Full |
| S-07 | Availability date change and affected-contacts list | 2 | MNL, PM | AS-02-04 | P1 | Full (contacts list depends on P2 prospects - XI-04) |
| S-08 | Move-in handover (condition record, items issued, channels) | 2 | LEA, PM | UC-11, AS-11-01/03/04/05/06 | P1 | Full |
| S-09 | Condition record view / discrepancy entry | 2/4 | LEA, RSS, MNL | AS-11-02, DC-17 | P1 | Full (window blocked on CCR-07 - XI-03) |
| S-10 | Move-out notice entry | 2 | RSS, LEA, PM | UC-33, AS-33-01 | P1 | Full |
| S-11 | Possession confirmation | 2 | PM, MNL | AS-33-02/03, CCR-15, DC-31 | P1 | Full |
| S-12 | Turnover checklist | 2 | MNL, PM | UC-35, AS-35-01/02/03 | P1 | Full |
| S-13 | Repair intake form | 3 | RSS, MNL, AHS, LEA, PM | UC-15, AS-15-01/02/04/05, CCR-30 | P1 | Full |
| S-14 | Triage board | 3 | MNL, PM | AS-15-02/03, CCR-03 | P1 | Full |
| S-15 | Work order detail (desk) | 3 | MNL, PM, RSS (view/edit per matrix) | UC-16, DC-19 | P1 | Full |
| S-16 | Entry scheduling and entry record | 3/9 | MNL, TEC | AS-16-01/02/03, CCR-14 | P1 | Full (notice rule L - XDR-02) |
| S-17 | Vendor dispatch | 3 | MNL, PM | UC-19, AS-19-01-04, CCR-26 | P1 | Full |
| S-18 | My jobs list (narrow) | 9 | TEC | UC-16, ACT-TEC | P1 | Full |
| S-19 | Job detail and completion (narrow) | 9 | TEC | AS-16-04/05/07, AS-09-05 | P1 | Full |
| S-20 | Household detail (parties, roles, channels) | 4 | RSS, LEA, PM | DC-05, DC-06, CCR-20, AS-11-05 | P1 | Full |
| S-21 | Keys and credentials register / issue / revoke | 4 | RSS, PM | UC-27, AS-11-06, DC-18 | P1 | Full |
| S-22 | Authority verification step (lockout, key, visitor, disclosure) | 4 | RSS, AHS, PM | AS-27-01/02, AS-29-01 | P1 | Full |
| S-23 | Accommodation referral (staff-side) | 4 (launch from anywhere) | any staff | AS-09-01/02/03 | P1 | Full |
| S-24 | Accommodation queue | 5 | ACR | UC-09, AS-09-04 | P1 | Full |
| S-25 | Accommodation request detail (supporting info, outcome) | 5 | ACR | AS-09-06/07/08, DC-15 | P1 shell; decision L | Outline for decision |
| S-26 | Arrangement authoring / publication | 5 | ACR | AS-09-05, CCR-09 | P1 | Full |
| S-27 | Users, capacities, coverage, offboarding | 8 | PM (admin) | CAP-1-3, AS-27-03, AS-29-03 | P1 | Full |
| S-28 | Policy versions (reviewed parameters) | 8 | PM (admin), reviewer | CCR-07, DC-37 | P1 (gating) | Full for gating display |
| S-29 | Audit log viewer | 8 | PM | CCR-32, matrix "Audit log" | P1 | Outline |
| S-30 | Legal hold and retention | 8 | PM | UC-29, CCR-22, DR-09 | L | Outline |
| S-31 | Degraded-mode notice and essential view | global | all staff | AS-01-04, QT-05 | P1 | Full (XDR-04) |
| S-40 | Offers and pricing | 6 | PM, LEA, OWN | UC-03 | P2 | Outline |
| S-41 | Listings and advertising review | 6 | LEA, PM | UC-04 | P2 | Outline |
| S-42 | Inquiries and tours | 6 | LEA | UC-05 | P2 | Outline |
| S-43 | Waiting list | 6 | LEA, PM | UC-06 | P3 | Outline |
| S-44 | Application intake | 6 | LEA | UC-07 | P2/L | Outline |
| S-45 | Screening and decision | 6 | LEA, PM | UC-08 | P3/L | Outline |
| S-46 | Lease preparation and signatures | 6 | LEA, PM | UC-10 | P3/L | Outline |
| S-47 | Service requests and household changes | 4 | RSS | UC-12 | P2 | Outline |
| S-48 | Transfers / special circumstances routing | 4 | RSS, PM | UC-13 | P3/L | Outline |
| S-49 | Complaints | 4 | RSS, PM | UC-14, CCR-19, SOD-4 | P2 | Outline |
| S-50 | Preventive maintenance / equipment / capital | 3 | MNL, PM, OWN | UC-17 | P2 | Outline |
| S-51 | Vendors and contracts | 3 | MNL, PM, ACC | UC-18 | P2 | Outline |
| S-52 | Purchasing and invoices | 3/7 | MNL, PM, ACC | UC-20, SOD-2, SOD-5 | P2 | Outline |
| S-53 | Household ledger and statements | 7 | ACC | UC-21 | P3/L | Outline |
| S-54 | Reconciliation and period close | 7 | ACC | UC-22, SOD-3 | P3/L | Outline |
| S-55 | Missed payment verification | 7 | ACC, PM | UC-23, CCR-13 | P3/L | Outline |
| S-56 | Owner report and distribution | 7 | ACC, PM, OWN | UC-24, CCR-17 | P3 | Outline |
| S-57 | Parking and storage assignment | 2 | RSS, PM | UC-25 | P3 | Outline |
| S-58 | Amenities, packages, closures | 2 | RSS | UC-26 | P3 | Outline |
| S-59 | Security incident / emergency board | 1/3 | PM, AHS, MNL | UC-28, AS-28-01-04 | P2 | Outline (emergency intake part of S-13 is Full) |
| S-60 | Renewals / violations / notices / legal matters | 6/8 | PM, CNS | UC-30-32 | P3/L | Outline; excluded from first slice |
| S-61 | Final inspection and deposit disposition | 2/7 | MNL, ACC | UC-34 | P3/L | Outline |
| S-62 | Oversight and consistency review | 8 | PM | UC-36 | P2 | Outline |
| S-63 | Program records | 4 | PM | UC-37 | L | Outline; excluded |
| S-64 | Compliance calendar | 1/8 | PM | UC-38 | P2 | Outline |
| S-65 | Management/ownership transfer export | 8 | PM | UC-39 | P3 | Outline |
| S-70 | External job view (vendor) | 10 | VEN | AS-19-01, PF-4 | DR-03 (d) | Outline |

Coverage note: every UC-01..UC-39 maps to at least one screen above. No screen exists
without a UC trace.

---

## 3. Journey state tables (full depth, Option A working scope)

Column convention for every table: **State** (current UI state) · **Trigger** ·
**Guard / precondition** · **Effect** (`OP-*` remote, or `local`) · **Next on success
/ on failure** · **Feedback** (visible + announced) · **Focus** (destination after
transition). Pending, retry, cancel and back behaviour follow PAT-01..PAT-08 unless a
row says otherwise. All guards that reflect permissions are enforced server-side;
client guards only pre-empt (definition §2) `[D]`.

### J-01 Daily handoff review and assignment (UC-01; ACT-PM, staff)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Entry | Open WS-1 | Authenticated; capacity selected | OP-HANDOFF-LIST (scope, capacity) | Loaded / Load-error | Skeleton rows; then heading "Today - <property>, <n> open matters" | Page heading (h1) |
| 2 | Loaded | (render) | - | local sort: unowned first, then past due, then due today, then rest | - | Sections "Needs an owner", "Past due", "Due today", "Upcoming"; each count reflects only matters visible to this capacity (DS-05) | - |
| 3 | Loaded, empty | No matters | - | - | - | Empty state: "No open matters in <scope>." plus link to end-of-shift entry | h1 |
| 4 | Loaded | Select matter row | Can view matter type | local navigate | Matter detail S-02 | - | Matter detail h1 |
| 5 | Loaded | Select restricted row (DS-01) | Cannot view content | none | Stays | Row reads "Restricted matter - owner: <designated reviewer capacity>, due <date>"; no type/household until XDR-01 decided | Row |
| 6 | Matter detail | "Assign owner" | Can assign (PM, or own-team lead per matrix [P]); assignee eligible in scope & capacity | OP-MATTER-ASSIGN (matter, assignee, due, version, idempotency key) | Assigned / Conflict, Denied, Validation | Pending: button "Assigning..." disabled; success toast + inline "Owner: X, due <date>" announced politely | Back to the row in S-01 when opened from list; else owner field |
| 7 | Assign pending | Response: conflict (matter reassigned meanwhile) | - | - | Conflict state | "This matter was assigned to <Y> at <time> by <Z>. Keep <Y> or assign to X?" (PAT-05) | Conflict message |
| 8 | Assign pending | Response: denied | - | - | Loaded | PAT-04 with reason (e.g. "Assigning maintenance matters needs the Maintenance lead or Property manager capacity.") | Message |
| 9 | Loaded | Scope change (selector) | Unsaved assignment dialog closed | OP-HANDOFF-LIST new scope | Loaded | "Showing <scope>"; counts refresh | h1 |
| 10 | Load-error | Retry | - | OP-HANDOFF-LIST | Loaded / Load-error | "Couldn't load today's matters. Retry." Previous successful list is not shown as current (PAT-06) | Retry button |
| 11 | Any | Service unavailable | - | - | J-15 | Degraded banner | Banner |

Failure semantics: duplicate assign → idempotency key, server returns same result
(PAT-02); stale at commit → row 7; handoff recipient sees assignment in their "My
matters" and on next load (notification DS-07); deadline provenance → due dates show
PAT-09 badge; outage → J-15. Unknown outcome: if the assign request times out, state
is "Assignment not confirmed - checking" and the UI re-reads the matter before
allowing another assign (PAT-03).

### J-02 End-of-shift entry and returned outcome (AS-01-02; any staff, ACT-AHS)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Matter detail or S-03 | "Add handoff entry" | Can edit matter, or AHS for emergency matters | local open form | Draft | Form fields: What happened, Who was contacted (party picker, DS-08), What was promised (with date), What remains, Next owner (required), Follow-up date (required) | First field |
| 2 | Draft | Submit | Required: next owner, follow-up date; promise date ≥ now | OP-HANDOFF-ENTRY-CREATE (idempotency key) | Recorded / Validation, Denied, Conflict | Validation per PAT-08; success "Handoff recorded. <Next owner> will see it." | Success: matter detail entry list, new entry |
| 3 | Draft | Leave page / change scope | Unsaved | local | PAT-07 dialog | "Discard handoff entry?" | Dialog |
| 4 | Recorded (recipient view) | Recipient opens "My matters" | Recipient is next owner | OP-HANDOFF-LIST | Shows "Handed to you by <X>: promised <promise> by <date>" | - | - |
| 5 | Recipient | "Record outcome" | Is current owner | OP-HANDOFF-OUTCOME-RECORD | Outcome recorded (promise kept / not kept with reason / reassigned) | "Outcome recorded; promise closed" | Entry |
| 6 | Promise past date without outcome | (time) | - | server-derived flag | Appears in S-01 "Past due" | "Promise overdue" badge (text + icon, not color only) | - |

Failure semantics: duplicate submit → PAT-02; next owner offboarded/coverage expired
before commit → server rejects (stale) → "<Name> no longer covers this property; pick
another owner" with draft preserved; recipient-returned outcome is mandatory to close
the promise (CCR-11) `[D]`.

### J-03 Repair intake and triage (UC-15, AS-15-01..05; RSS, MNL, AHS, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Entry | "Report a repair" (any workspace, or from household/home) | Capacity may create work orders | local | Form | Fields: Home/space (scoped picker), Reported by (party role + channel; "on behalf of" when staff-entered, PAT-11), Location in home, Symptoms, Hazard now? (yes/no/unsure), Access arrangement, Urgency circumstances, Reported time (defaults now, editable with reason) | Home picker |
| 2 | Form | Hazard = yes, or symptom matches emergency list (flooding, gas, fire, essential service loss, failed secure entrance) | - | local | Emergency form variant | Prominent text "Possible emergency - follow the emergency steps now"; emergency steps panel (responders per UC-28 outline) appears above the remaining fields; no animation (PAT-12) | Emergency steps heading |
| 3 | Form | Home selected | - | OP-WO-DUPLICATE-CANDIDATES (home, location, window) | Candidates shown / none | "Possible existing report: <WO id, symptom, reported time>" - only work orders the user may view; never shows another household's identity beyond the home label already selected (DS-02) | Stays on field; candidates in a polite live region |
| 4 | Form | "This is the same issue" on a candidate | - | local mark link | Form (linked) | "Will be linked to <WO>; reporter will receive updates" | Candidate |
| 5 | Form | Submit | Required fields; no field asks about protected characteristics or irrelevant sensitive data (CCR-30) [D] | OP-WO-CREATE or OP-WO-LINK-REPORT (idempotency key) | Created / Validation, Denied, Conflict | Pending "Saving report..."; success "Repair <id> recorded at <time>. Priority: not yet triaged" or for emergency "Emergency <id> recorded. Immediate-action owner: <name/none>" | Success summary heading |
| 6 | Created (emergency) | No immediate-action owner assigned | - | - | Stays flagged | Persistent alert "No one owns this emergency yet - assign now"; appears at top of S-01 and S-14 | Assign control |
| 7 | Triage board | Set priority category | MNL/PM capacity | OP-WO-TRIAGE (priority category, factors: safety, impact, age, resources; version) | Triaged / Conflict, Denied | Priority shown with the factors that justify it; no balance or complaint history fields exist on this screen (CCR-03, CCR-13) [D] | Next untriaged item |
| 8 | Triage board | Sort/filter | - | local | - | Allowed sort keys: priority, age, safety, reported time; no sort/filter by balance, household, complaint history (CCR-03) [D] | - |
| 9 | Created | Submit times out | - | - | Unknown | "Not confirmed - checking whether the report was saved." Re-read by idempotency key; if found → Created; if not → Form with data intact and "Not saved. Submit again." (PAT-03) | Message |

Failure semantics: duplicate submission (row 9, PAT-02) and duplicate *report*
(rows 3-4, CCR-27); unknown outcome (row 9); partial failure: created but responder
contact not recorded → work order shows "Responder contact: not recorded" as an open
item; stale facts: home's household changed between open and submit → server returns
current household and the reporter field is rechecked; handoff: immediate-action
owner (row 6); outage: emergency intake is an essential function (J-15); deadline
provenance: CT-01 targets display as "Target (internal)" unless a legal deadline
exists (PAT-09) - CT-01 has no default (DR-07) so the target slot shows "No target
configured".

### J-04 Entry scheduling and entry record (UC-16 AS-16-01..03, CCR-14; MNL, TEC)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Work order | "Schedule visit" | Can edit WO; home occupied? | OP-ENTRY-REQUIREMENTS (home, WO) | Requirements shown / Policy-missing | Shows which entry basis applies: occupied/unoccupied; reviewed entry-notice policy version (id, reviewer, effective date) or "No reviewed entry-notice policy" | First field |
| 2 | Requirements shown, policy present | Choose time; record notice (method, time, recipient) | Notice time satisfies configured rule | OP-ENTRY-NOTICE-RECORD | Scheduled / Validation | Inline "Notice must be given by <time> under <policy vX>"; success "Visit scheduled; notice recorded" | Schedule summary |
| 3 | Policy-missing, occupied home, non-emergency | Attempt schedule | CCR-07: absent reviewed value, step blocked [D] | none | Blocked | "Non-emergency entry can't be scheduled: no reviewed entry-notice policy for <property>. Ask <policy owner> to add one." (PAT-04); see XDR-02 for a possible resident-authorized-visit path | Message |
| 4 | Work order | "Record emergency entry" | Emergency category, or user states emergency reason | OP-ENTRY-EMERGENCY-RECORD (reason, time, who entered) | Recorded; flagged for review (CCR-31) | "Emergency entry recorded; it will be reviewed by <PM>" | Entry record |
| 5 | Scheduled | Later unrelated visit requested | Prior entry authorization is single-visit | OP-ENTRY-REQUIREMENTS | Requires new notice | "The earlier notice covered <date> only. This visit needs its own notice." (AS-16-03) [D] | First field |
| 6 | Scheduled | Notice delivery outcome unknown (e.g. message not confirmed) | - | - | Notice unconfirmed | Status "Notice: not confirmed" - visit cannot be marked "notice satisfied" until reconciled (CCR-26) [D] | Status |

### J-05 Job execution and completion on narrow screen (UC-16 AS-16-04..07, AS-09-05; TEC)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | My jobs | Open WS-9 | TEC capacity; only assigned WOs | OP-MYJOBS-LIST | Loaded / empty / error | Cards ordered by scheduled time; each: home label, symptom, access status ("Notice satisfied" / "Emergency" / "Not cleared"), arrangement-to-honour indicator | h1 |
| 2 | Job detail | Open job | Assigned | OP-WO-READ (technician view) | Detail | Sections in priority order: Hazards; Access arrangement and entry status; Arrangement to honour (text only, DS-06); Symptoms/location; Resident contact for this job (DS-09) | h1 |
| 3 | Job detail | "Start work" | Entry status cleared (notice satisfied or emergency recorded) | OP-WO-STATUS-UPDATE (in progress, version) | In progress / Blocked, Conflict | If not cleared: "You can't start: entry isn't cleared (<reason>)" | Status |
| 4 | In progress | Add labour/materials | - | OP-WO-LABOUR-ADD, OP-WO-MATERIAL-ADD | Added | Inline confirmation | Added row |
| 5 | In progress | Add photo | Defect photo only; guidance "Photograph the defect, not private belongings" (DC-17, N9.2 via ACT-TEC) [D] | OP-ATTACHMENT-UPLOAD (classification: defect photo, restricted) | Uploaded / failed | Per-file progress; failure keeps the file selected with "Upload failed - retry" | File item |
| 6 | In progress | "Temporary repair" or "Part ordered" | - | OP-WO-OUTSTANDING-ADD | Awaiting part/specialist | "Work order stays open: <item>" | Status |
| 7 | In progress / awaiting | "Complete" | No outstanding items (AS-16-04) | OP-WO-COMPLETE | Completed (awaiting verification) / Blocked | Blocked: "Can't complete: 1 outstanding item - <item>" with link | Outstanding item |
| 8 | Completed | Lead verifies (desk S-15) | MNL/PM | OP-WO-VERIFY (recurring cause, resident informed method) | Verified → Closed | "Closed. Resident informed by <channel>." | Summary |
| 9 | In progress | "Home unusable" | - | OP-WO-UNUSABLE-FLAG | Escalated to PM (relocation decision recorded by PM, AS-16-06) | "Flagged to <PM>; relocation decision needed" | Status |
| 10 | Any | Network lost mid-action | - | - | Unknown | "Not saved - no connection. Your entry is kept on this screen; it is not on the server." No offline queue (XDR-03) | Message |
| 11 | Completed | Damage charge contested (desk) | - | separate matter (AS-16-07) | Does not reopen or block repair | "Charge dispute recorded separately" | - |

### J-06 Vendor dispatch and confirmation (UC-19; MNL, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Work order | "Dispatch vendor" | Can assign vendors; vendor active (insurance/qualification checks are UC-18 outline) | local open | Dispatch form | Preview "What the vendor will receive": job info, access arrangement, arrangement-to-honour text; nothing else (DS-06, AS-19-01) | Vendor picker |
| 2 | Dispatch form | Send | Preview acknowledged | OP-DISPATCH-CREATE (idempotency key); delivery is manual under DR-05 recommendation | Sent - unconfirmed | Status "Dispatched - unconfirmed" (never "Scheduled") (AS-19-03) | Status |
| 3 | Unconfirmed | "Record vendor confirmation" (date/time, who confirmed, how) | - | OP-DISPATCH-CONFIRM | Confirmed/Scheduled | "Vendor confirmed visit <time>" | Status |
| 4 | Unconfirmed | Past follow-up time | - | server flag | Shown in S-01 | "Vendor not confirmed since <time>" | - |
| 5 | Unconfirmed | "Dispatch again" | Must reconcile first | none | Reconcile prompt | "Check with <vendor> whether they received the first request before sending another." Options: "They have it" (→ row 3), "They don't" (→ resend linked to first) | Prompt |
| 6 | Confirmed | Resident informed | - | OP-RESIDENT-NOTIFY-RECORD (who/when/what, channel) | Informed | Shows channel used (CCR-20) | - |
| 7 | Job closed | (close) | Temporary credentials issued to vendor | OP-CREDENTIAL-REVOKE (or recover) | Revoked / outstanding | WO cannot close while vendor credential is outstanding: "Recover vendor key <id>" (AS-19-04) | Credential item |

### J-07 Readiness, mark ready, availability date change (UC-02; MNL, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Home detail | Open | View inventory | OP-HOME-READ | Shown | Status label from DC-02; "Anticipated: <date>" and "Confirmed: <date + basis> / not confirmed" as separate labelled fields (CCR-06); "Possession: not returned/returned (<basis>)" (AS-02-01) | h1 |
| 2 | Readiness checklist | Toggle item complete | MNL/PM | OP-READINESS-ITEM-UPDATE (version) | Updated / Conflict | Item state change announced; progress "7 of 9 complete" | Same item |
| 3 | Checklist | "Mark ready" | All items complete; possession confirmed; promised spaces available (AS-02-05) | OP-HOME-MARK-READY (basis) | Ready / Blocked, Conflict | Blocked: "Can't mark ready: <n> open items" listing each with links; never offers override for unsafe items (AS-02-02, AS-11-03) [D] | Blocked: first open item; success: status |
| 4 | Home detail | "Change anticipated date" | - | OP-AVAILABILITY-UPDATE (new date, reason) | Updated + affected list | "Date changed. <n> people linked to this home need contact" with follow-up tasks created (AS-02-04) | Affected list heading |
| 5 | Home detail | "Confirm date" | Basis required (e.g. possession returned + ready) | OP-AVAILABILITY-CONFIRM | Confirmed / Validation | "Confirmed <date> - basis: <basis>" | Field |
| 6 | Any | Status concept "Leased"/"Reserved" | Derived only from distinct facts (CCR-05) | - | - | UI never labels a home leased because an application was approved (AS-10-03) [D] | - |

### J-08 Accommodation referral and arrangement (UC-09 P1 part; any staff → ACT-ACR)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Any record screen | "Record a request for help/change" (available from household, repair intake, matter detail) | Any staff capacity | local | Referral form S-23 | Plain prompt: "Describe what the person asked for, in their words." No legal terms or category required; optional type (accommodation, modification, animal, not sure) (AS-09-01) [D] | Description field |
| 2 | Referral form | Requester is a representative | - | local | Shows representative scope check (PAT-10) | "On behalf of <resident> by <rep>" (AS-09-02) | Rep field |
| 3 | Referral form | Submit | No fee field exists on the form (AS-09-03) [D] | OP-ACC-REFERRAL-CREATE (idempotency key) | Referred | "Request sent to the designated reviewer on <date>. You won't see further details." Referrer's own copy of the description is not retained in their views after submit [P] (DS-01) | Confirmation heading |
| 4 | Queue (ACR) | Open S-24 | ACR capacity | OP-ACC-QUEUE | List | Each row: received date, acknowledgement due with provenance (PAT-09; CT-03 has no default → "No target configured"; legal deadline if configured) (AS-09-04) | h1 |
| 5 | ACR detail | Acknowledge | - | OP-ACC-ACKNOWLEDGE (method/channel) | Acknowledged | "Acknowledged <date> via <channel>" | Status |
| 6 | ACR detail | Decision actions | Policy versions required (L) | - | Outline | Approve/alternative/deny controls disabled with "Requires reviewed accommodation policy (CCR-07)" until configured; record of alternatives discussed precedes denial (AS-09-06) | - |
| 7 | ACR arrangement authoring | Write arrangement to honour | Outcome approved/alternative agreed | local draft | Draft | Authoring guidance: "Write what others must do, not why. Don't mention health, diagnosis or disability." Live preview "What technicians / accounting / front desk will see" per audience (DS-06) [P] | Text field |
| 8 | Arrangement draft | Publish | Text non-empty; ACR confirms preview | OP-ACC-ARRANGEMENT-PUBLISH (audiences, version) | Published | "Arrangement published to: work orders for <home>, accounting charge treatment" | Status |
| 9 | Work order (TEC/MNL) | Open job for that home | - | OP-WO-READ | Shows arrangement | "Arrangement to honour: <text>" only; no link to the request (AS-09-05) [D] | - |
| 10 | Request during enforcement | (linked matter exists) | - | server | Linked matter shows "Pending review - escalation blocked" to authorized viewers only (AS-09-07); UC-32 out of first slice (XI-05) | - | - |

### J-09 Move-in handover (UC-11; LEA, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Home ready | "Start handover" | Home status ready (not merely rent paid; AS-11-03); lease fully executed fact recorded (CCR-05) | OP-HANDOVER-START | Handover / Blocked | Blocked lists missing facts separately: "Home not ready (<items>)", "Lease not fully executed" | Blocked list |
| 2 | Handover | Inspection notes/photos | - | OP-CONDITION-RECORD-CREATE (new tenancy record, AS-35-03) | Recorded | "Condition record <id> dated <date>" | Notes field |
| 3 | Handover | Noncritical open work | - | OP-MATTER-ASSIGN per item | Each item owned (AS-11-04) | "Owner and follow-up required for each open item" validation | First unassigned item |
| 4 | Handover | Confirm channels | Resident's usable channel recorded | OP-CHANNEL-CONFIRM | Recorded (AS-11-05) | "Notices and receipts will use: <channel>" | Field |
| 5 | Handover | Issue keys/credentials/permits | Each item linked to holder + home/space | OP-CREDENTIAL-ISSUE (per item, idempotency) | Issued / Conflict (already held) | Per-item status; partial failure shows which items were not issued | First failed item |
| 6 | Handover | Complete | All required steps done | OP-HANDOVER-COMPLETE | Occupied | "Move-in complete" summary of what was issued and open items | Summary |
| 7 | After move-in | Resident reports discrepancy | Within configured window (CCR-07 → blocked if no reviewed window; XI-03) | OP-CONDITION-DISCREPANCY-ADD | Added as move-in discrepancy, distinct from later damage (AS-11-02) | "Added to move-in condition record" | Entry |

### J-10 Keys, lockout and authority verification (UC-27, AS-29-01; RSS, AHS, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Household / key register | "Lockout / replacement key" | RSS/AHS/PM | local | Verification step S-22 | Shows authorized parties for the home (roles only needed for the decision) and verification method fields; no other household data | First field |
| 2 | Verification | Record verification | Requester matches an authorized party (or rep within scope/validity) | OP-AUTHORITY-VERIFY | Verified / Not verified | Not verified: "Can't issue: <reason>". No issue button until verified (AS-27-01) | Result |
| 3 | Verification | Disputed household relationship indicated, or request to exclude another occupant | - | OP-MATTER-CREATE (routed to PM) | Routed | "This needs the property manager. Front desk can't change access between household members." (AS-27-02, CCR-15) [D] | Message |
| 4 | Verified | Issue | - | OP-CREDENTIAL-ISSUE | Issued | "Key <id> issued to <holder>" | Register row |
| 5 | Register | Revoke credential of an occupant | Recorded lawful authority required (court order / verified return of possession) (CCR-15) | OP-CREDENTIAL-REVOKE | Revoked / Refused | Refused: "Access can't be removed from an occupant without recorded lawful authority." Basis field lists only lawful bases | Basis field |
| 6 | Offboarding (S-27) | Staff/vendor departs | - | OP-USER-OFFBOARD (revokes credentials, sessions, coverage) | Revoked, per-item | Per-item results; outstanding physical keys listed as "to recover" (AS-27-03) | Results list |

### J-11 Move-out notice and possession (UC-33; RSS, LEA, PM, MNL)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Household | "Record notice to vacate" | - | OP-MOVEOUT-NOTICE-RECORD (anticipated date, forwarding info, items to return, inspection) | Notice recorded | Home shows "Notice received - anticipated <date>; possession not returned" (CCR-05/06) | Summary |
| 2 | Home | "Confirm possession returned" | Basis: surrender with keys returned, or enforcement of judgment recorded (L outline), with evidence | OP-POSSESSION-CONFIRM (basis, evidence, version) | Returned / Refused | Basis options listed; "Home appears empty" is not a basis; choosing "Appears abandoned" routes a review matter instead (AS-33-02) | Basis field |
| 3 | Home | Remaining occupant, death or property left | - | OP-MATTER-CREATE (separate review) | Review matter | "Separate review opened; owner <PM>" (AS-33-03) | Message |

### J-12 Turnover (UC-35; MNL, PM)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Possession returned | "Start turnover" | Possession basis recorded | OP-TURNOVER-START | Checklist: secure, access updated, utilities, make-ready (→ J-07) | Checklist | First item |
| 2 | Turnover | Release parking/storage | No outstanding obligation (AS-35-02) | OP-SPACE-RELEASE | Released / Blocked | "Can't release <space>: <obligation>" | Item |
| 3 | Turnover | Complete | All items | OP-TURNOVER-COMPLETE | Make-ready | New tenancy will get a new condition record (AS-35-03) | Summary |

### J-13 Disclosure request by phone (AS-29-01; RSS, any staff)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Household | "Someone is asking for information" | - | local | Verification S-22 | Ask who is calling, their role, what they want | First field |
| 2 | Verification | Record verification | Recipient authorized for the requested category (resident, rep within scope, guarantor for obligation information only) | OP-DISCLOSURE-VERIFY | Verified-for-<category> / Not verified | Only the verified category becomes visible in a "What you may share" panel; others stay hidden | Panel |
| 3 | Not verified | - | - | - | - | "Don't share information with this caller. Offer to contact the resident through their recorded channel." | Message |

### J-14 Capacity selection and acting-for (CAP-1, CCR-32; cross-cutting)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Sign-in | First screen | User holds >1 capacity | OP-SESSION-CAPACITIES | Capacity chooser | "Choose how you're working now" with capacity names and scopes | First option |
| 2 | Any | Switch capacity | No unsaved data, or PAT-07 resolved | OP-SESSION-CAPACITY-SET | Workspace reloaded | "Now acting as <capacity>"; nav updates | h1 |
| 3 | Any form | Consequential submit | - | included in every write | - | Confirmation line "Recorded as <capacity>" (and "for <principal> on instruction of <rep>") | - |
| 4 | Acting-for | Rep validity expired or scope excludes action | - | server rejects | Denied | "<Rep>'s authority doesn't cover this (expired <date> / scope <scope>)." | Message |
| 5 | Small property, SOD conflict (SOD-4, CAP-4) | Action requires someone else | - | server returns routing | Routed | "This must be done by someone other than you; sent to <route>" (route owner open, DR-06) | Message |

### J-15 Degraded operation (AS-01-04, QT-05)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | Normal | Health check fails / writes failing | - | OP-SERVICE-STATUS | Degraded | Persistent banner "Some functions are unavailable. Emergency reporting: <fallback>." Never implies saved when not | Banner (announced assertively once) |
| 2 | Degraded | Write attempt in a non-essential function | - | - | Blocked | "Not available right now. Your entry is kept on this screen until you leave." | Message |
| 3 | Fully unavailable | - | - | outside app | Fallback per XDR-04 | - | - |
| 4 | Restored | - | - | - | Normal | "Service restored. Enter events recorded during the outage." Link to back-entry with original event time and "entered late" marker | Banner |

### J-16 Lost device / compromised account (AS-29-03; any staff, PM admin)

| # | State | Trigger | Guard | Effect | Next success / failure | Feedback | Focus |
|---|---|---|---|---|---|---|---|
| 1 | S-27 | "Revoke sessions" for a user | Admin capacity | OP-USER-SESSIONS-REVOKE + OP-INCIDENT-CREATE | Revoked / partial | "Sessions revoked at <time>; incident <id> opened" | Result |

---

## 4. Shared patterns

| ID | Pattern | Rule | Tag |
|---|---|---|---|
| PAT-01 | Pending | Any remote write shows an in-control pending label, disables the triggering control, keeps the form readable, and announces "Saving" politely. No optimistic success: P1 writes are confirmed by the server before showing success. Exception: none proposed. | [P] |
| PAT-02 | Duplicate submission | Every create/consequential write carries a client-generated idempotency key; a repeat returns the original result and the UI shows "Already recorded" with a link. | [P] (needs Architecture idempotency semantics) |
| PAT-03 | Unknown outcome | Timeout/network loss after send → "Not confirmed - checking"; UI re-reads by idempotency key before enabling retry. External actions (vendor dispatch, notice delivery, future payments/screening) have explicit `unconfirmed`/`unknown` statuses that never reuse success wording, icons or color. | [D] CCR-26 |
| PAT-04 | Denied / blocked / not available | Three distinct presentations: **Denied** (in scope, capacity lacks the verb): states which capacity can act and why, links to the policy; **Blocked by rule** (e.g. outstanding items, missing reviewed policy): names each unmet condition with a link; **Not available** (out of scope or nonexistent): identical message for both, does not confirm existence (XDR-08). Never hide a denied *action* the user can see a reason for; do hide controls whose very presence would disclose restricted information. | [D] contract §3 behavioural policies; [P] presentation |
| PAT-05 | Stale facts at commit (conflict) | Writes carry the record version; on conflict, show what changed, by whom and when, keep the user's input, and offer "Apply mine to current" (re-validated) or "Discard mine". Never silent overwrite. | [P] (needs Architecture concurrency semantics) |
| PAT-06 | Load error / stale data | On load failure, no cached data is presented as current; if a last-known view is shown it is labelled "As of <time> - may be out of date" and read-only. | [P] |
| PAT-07 | Unsaved data | Leaving a dirty form, changing scope or capacity, or session expiry prompts "Keep editing / Discard". On coverage/session expiry, the draft is kept in the page until navigation; it is not stored in browser storage when it contains restricted categories (DS-10). | [P] |
| PAT-08 | Validation | Validate on submit and on field blur after first submit; errors listed in a summary at the top (focus moves there, each item links to its field) and associated with fields programmatically; all user input preserved. Server validation errors map to the same presentation. | [P] |
| PAT-09 | Deadline / target provenance | Every due date shows its kind: "Legal/program deadline - <policy vX, reviewer, effective date>" or "Internal target - <CT-id>". Where both apply, the stricter governs and both are visible. "No target configured" when CT has no value. | [D] CCR-28 |
| PAT-10 | Capacity and acting-for | See J-14. Every write records capacity and principal; the UI displays them in confirmations and in record history. | [D] CCR-32, CAP-1 |
| PAT-11 | Recorded on behalf / channel | Staff-entered records capture source channel (phone, walk-in, paper, email) and the party; residents without portal are first-class (PF-6). | [D] CCR-20, PF-6 |
| PAT-12 | Motion | No essential information conveyed by motion; transitions ≤ short duration; with reduced-motion preference all non-essential motion is removed; no auto-advancing content; emergency alerts are static. | [P]; thresholds [K] (reviewer: accessibility reviewer, XDR-06) |
| PAT-13 | Status vocabulary | Each domain state from DC-02/DC-19/DC-31/DC-15 has one label; anticipated vs confirmed, approved vs signed vs paid vs possession are never collapsed into one badge. Status shown as text (+ icon), never color alone. | [D] CCR-05, CCR-06 |
| PAT-14 | Lists | Lists show counts of items the viewer may see; pagination announces range; sort/filter keys exclude prohibited factors (CCR-01, CCR-03); empty states explain scope ("in <property>"). | [D]/[P] |
| PAT-15 | Party picker | Selecting a person shows role(s) relevant to the action only; for recipients, only parties authorized for the content category are selectable (DS-08). | [D] ACTORS §3.2 |
| PAT-16 | Policy-missing gate | When CCR-07 blocks a step, the UI names the missing policy type, the property, and the policy owner (DR-10); never offers a default value. | [D] CCR-07 |
| PAT-17 | Attachments | Each attachment has a classification (defect photo, condition photo, ID document, supporting information, other) with its own access; previews/thumbnails obey the same access; restricted attachments show "Restricted attachment" without filename to unauthorized viewers. | [D] ACTORS §3.2 attachments |

---

## 5. Disclosure rules (contract §3 disclosure-surfaces checklist)

### 5.1 Rules

| ID | Surface | Rule | Tag / source |
|---|---|---|---|
| DS-01 | Lists, handoff, counts | Accommodation, disability, survivor status, screening, complaint-about-staff matters appear to non-authorized viewers only as "Restricted matter" with owner capacity and due date, no type, no description; whether even the household label appears is XDR-01. Counts exclude matters the viewer cannot see, or show "+ n restricted" only to PM [P]. | [D] AS-01-03, CCR-09; [P] presentation |
| DS-02 | Search and suggestions | Restricted categories are not indexed for unauthorized capacities: no hits, no autocomplete, no "did you mean", no result counts that differ by hidden content. Duplicate-candidate suggestions show only work orders the user may view. | [D] ACTORS §3.2 |
| DS-03 | Breadcrumbs, titles, browser tab titles, URLs | Never contain a restricted category word or a person's name for restricted records; use record IDs (e.g. "Matter M-1042"). URLs carry opaque IDs, no names or categories. | [P] |
| DS-04 | Navigation | Workspaces the capacity cannot use are absent, not disabled (presence of WS-5 menu is not itself sensitive, but its item counts are) [P]. | [P] |
| DS-05 | Counts / dashboards | Counts computed in the viewer's scope and capacity; owner aggregates suppress small cells that would re-identify a household (threshold value needs authority - XI-06). | [D] ACTORS §3.2; [P] |
| DS-06 | Previews / work orders / vendor view | Show "Arrangement to honour: <text>" only; never the reason, request, or link to it; vendor sees job info + access + arrangement text only. ACR previews each audience view before publishing (J-08 #7). | [D] AS-09-05, AS-19-01, CCR-09 |
| DS-07 | Notifications (in-app, browser, email - channel per XDR-07) | Content limited to "<record type-neutral label> needs your attention - <property>"; no names, balances, medical, legal-stage, accommodation or complaint content; opening requires sign-in and authorization. Safe for lock screen / shared device. | [D] ACTORS §3.2 messages; [P] wording |
| DS-08 | Recipient selection | Recipient picker lists only parties verified for the content category; guarantors only for obligation information; representative only within scope and validity; verification recorded (J-13). | [D] ACTORS §3.2, AS-29-01 |
| DS-09 | Technician / vendor contact data | Resident contact shown in job context only for the job's duration; not in My jobs list cards beyond home label [P]. | [D] ACT-TEC boundary |
| DS-10 | Shared devices / browser | No restricted content in browser storage, autofill or download caches; session timeout with draft discard for restricted forms; "Sign out" visible on narrow screens. Timeout value needs authority (XI-07). | [P]; [K] (reviewer: Architecture security) |
| DS-11 | Exports and print | P1 has no bulk export except the audit viewer (PM) and S-31 essential sheet (XDR-04); print views apply the same field rules and show "Printed by <user> <time> - confidential" footer [P]. Counsel/successor packages are outline (UC-32, UC-39). | [D] ACTORS §3.2 exports |
| DS-12 | Attachments | PAT-17. | [D] |
| DS-13 | Permission verbs | Distinct controls per verb: view, edit, propose, approve, send/execute, export, share. A capacity with *propose* sees "Propose" (not "Save" or "Approve"); approve actions name the approver capacity; send actions preview recipients and content. | [D] contract §3, ACTORS §3.1 |
| DS-14 | Capacity / acting-for context | Always visible (global chrome); included in confirmations, history and printouts. | [D] CCR-32 |
| DS-15 | Emergency lists | Access/evacuation needs list (UC-28) shows the needed assistance ("needs assistance with stairs") without diagnosis; visible to authorized emergency capacities only. | [D] ACTORS §3.2 emergency lists |
| DS-16 | Audit and history views | Record history shows actor/capacity/time/basis; for restricted records, history is visible only to those who may see the record. | [P] |
| DS-17 | Error messages | Errors never reveal restricted content or existence (e.g. a conflict message on a restricted matter says "updated by another user" only to unauthorized viewers) [P]. | [P] |

### 5.2 Screen × surface application (P1 screens)

Legend: ✓ rule applied (DS id), – surface not present on screen.

| Screen | Lists/search | Counts | Breadcrumb/title | Preview | Attachments | Messages/notif. | Export/print | Recipient | Verbs | Capacity |
|---|---|---|---|---|---|---|---|---|---|---|
| S-01 handoff | DS-01/02 | DS-05 | DS-03 | DS-01 | – | DS-07 | DS-11 (print) | – | DS-13 assign | DS-14 |
| S-02 matter | – | – | DS-03 | – | DS-12 | DS-07 | DS-11 | DS-08 contacted | DS-13 | DS-14 |
| S-03 handoff entry | – | – | DS-03 | – | – | DS-07 (to next owner) | – | DS-08 | DS-13 | DS-14 |
| S-04/05 inventory, home | DS-02 | DS-05 | DS-03 | DS-01 (restricted holds show "held") | DS-12 (listing photos outline) | – | DS-11 | – | DS-13 | DS-14 |
| S-06/07 readiness, date change | – | – | DS-03 | – | – | DS-07 (affected contacts tasks) | – | DS-08 | DS-13 | DS-14 |
| S-08/09 move-in, condition | – | – | DS-03 | – | DS-12 condition photos | DS-07 | DS-11 | DS-08 channel | DS-13 | DS-14 |
| S-10/11/12 move-out, possession, turnover | – | – | DS-03 | – | DS-12 evidence | DS-07 | – | – | DS-13 | DS-14 |
| S-13 intake | DS-02 duplicates, home picker | – | DS-03 | DS-06 | DS-12 | DS-07 | – | – | DS-13 | DS-14, PAT-11 |
| S-14 triage | DS-01/02, PAT-14 sort keys | DS-05 | DS-03 | DS-06 | – | DS-07 | DS-11 | – | DS-13 | DS-14 |
| S-15/16 WO, entry | – | – | DS-03 | DS-06 | DS-12 | DS-07 | DS-11 | DS-08 notice recipient | DS-13 | DS-14 |
| S-17 dispatch | – | – | DS-03 | DS-06 vendor preview | DS-12 (what vendor gets) | DS-07 | – | DS-08 vendor | DS-13 send | DS-14 |
| S-18/19 my jobs | DS-09 | – | DS-03 | DS-06 | DS-12 | DS-07 | – | – | DS-13 | DS-14 |
| S-20 household | DS-02 | – | DS-03 | DS-01 | DS-12 ID docs | DS-07 | DS-11 | DS-08 | DS-13 | DS-14 |
| S-21/22 keys, verification | DS-02 | – | DS-03 | – | DS-12 ID docs | – | – | DS-08 | DS-13 | DS-14 |
| S-23 referral | – | – | DS-03 | – | DS-12 (supporting docs go to ACR only) | DS-07 | – | – | DS-13 | DS-14 |
| S-24-26 ACR | DS-02 (ACR-only index) | DS-05 | DS-03 | DS-06 (audience preview) | DS-12 supporting info | DS-07 | DS-11 | DS-08 requester/rep | DS-13 approve/publish | DS-14 |
| S-27/28/29 admin | DS-16 | – | DS-03 | – | – | DS-07 | DS-11 audit | – | DS-13 | DS-14 |
| S-31 degraded | – | – | – | – | – | DS-07 | DS-11 / XDR-04 | – | – | DS-14 |

Messages: every outbound-message interaction (notice of entry, resident informed,
vendor dispatch, applicant incomplete notice in P2) passes DS-07 + DS-08 and records
the channel (CCR-20); legal-notice effect is never implied by a portal message
(CCR-21) `[D]`.

---

## 6. Failure-semantics checklist coverage (contract §3), per journey

| Journey | Duplicate / retry | Unknown external outcome | Partial failure | Stale at commit | Handoff (recipient, follow-up, returned outcome) | Outage / degraded | Deadline provenance |
|---|---|---|---|---|---|---|---|
| J-01 | PAT-02 | PAT-03 row note | n/a: single write | row 7 | assignment + My matters | J-15 | PAT-09 due dates |
| J-02 | PAT-02 | PAT-03 | n/a | next owner no longer eligible | rows 4-6 (returned outcome mandatory) | J-15 | promise date (internal) |
| J-03 | PAT-02 + CCR-27 linking | row 9 | responder contact not recorded | household changed | immediate-action owner (row 6) | essential function | CT-01 "No target configured" |
| J-04 | PAT-02 | row 6 notice unconfirmed | notice recorded, visit not | policy version changed before commit → revalidate | entry review to PM (row 4) | blocked; emergency entry recorded after restore (J-15 #4) | notice timing from policy (legal) |
| J-05 | PAT-02 | row 10 | photos partially uploaded (row 5) | status changed by lead | completion → lead verification (row 8) | row 10, no offline (XDR-03) | CT-01 |
| J-06 | resend only after reconcile (row 5) | rows 2-5 | resident informed but vendor unconfirmed | vendor deactivated | vendor outcome returned to WO (AS-19-02) | manual dispatch continues outside app; back-entry | vendor response expectation (UC-18 outline) |
| J-07 | PAT-02 | n/a: internal | some items updated, mark-ready refused | concurrent item update | affected-contact tasks (row 4) | read-only | anticipated vs confirmed (CCR-06) |
| J-08 | PAT-02 | n/a: internal; acknowledgement channel delivery unconfirmed → status "sent, unconfirmed" | arrangement published to some audiences fails → per-audience status | request withdrawn while authoring | referral → ACR queue; acknowledgement | referral is not an essential function [P] - record on paper and back-enter | CT-03 vs legal (PAT-09) |
| J-09 | PAT-02 per item | n/a | items issued partially (row 5) | readiness revoked before start | open items each owned | blocked | discrepancy window (CCR-07) |
| J-10 | PAT-02 | n/a | offboarding partial (row 6) | credential already revoked/issued | disputed → PM matter | key verification essential (QT-05) | - |
| J-11 | PAT-02 | n/a | - | possession already recorded | review matters | blocked | anticipated date |
| J-12 | PAT-02 | utilities transfer external, status "requested, unconfirmed" [P] | items | space reassigned | make-ready → J-07 | blocked | - |
| J-13 | n/a | n/a | - | verification stale → re-verify per call [P] | - | refuse disclosure while unavailable | - |
| J-14 | n/a | n/a | - | capacity expired mid-form | SOD routing | - | coverage end date |
| J-15 | back-entry duplicates flagged | n/a | some writes failed before outage → per-record status | - | restore banner tasks | itself | - |

---

## 7. Content and validation (provisional, brand-neutral)

No brand voice exists (XDR-09). Provisional rules `[P]`: plain language, short
sentences, say what happened, what it means, what to do next; never playful in error,
denial, emergency, possession, accommodation or disclosure contexts; never imply a
legal determination (CCR-29) `[D]` - legal questions route to "Ask <designated
manager>". Terms follow the Requirements glossary of distinct facts (CCR-05).

| Key | Context | Provisional copy |
|---|---|---|
| C-01 | Unknown outcome | "Not confirmed yet. We're checking whether this was saved. Don't submit again." |
| C-02 | Policy missing | "This step needs a reviewed <policy type> policy for <property>. <Owner> can add one." |
| C-03 | Denied | "<Action> needs the <capacity> role. You're working as <current capacity>." |
| C-04 | Not available | "This item isn't available. Check the property selected or the link." |
| C-05 | Restricted matter row | "Restricted matter · owner: <capacity> · due <date>" |
| C-06 | Unsafe ready attempt | "Can't mark ready: <item> is unsafe. Rent status doesn't affect readiness." |
| C-07 | Possession basis | "Choose how possession was returned. 'Looks empty' isn't enough - start an abandonment review instead." |
| C-08 | Vendor unconfirmed | "Dispatched, not confirmed. Check with <vendor> before sending again." |
| C-09 | Referral sent | "Sent to the designated reviewer. For privacy, you won't see the details from now on." |
| C-10 | Arrangement authoring hint | "Write what others must do, not why. Don't include health or diagnosis details." |
| C-11 | Front desk access dispute | "Changing who can enter a home between household members needs the property manager." |
| C-12 | Degraded | "Some functions are unavailable. For emergencies: <fallback>. Nothing you enter now is saved unless you see 'Saved'." |

Validation: PAT-08. Field labels are visible (not placeholder-only); required fields
marked in text; date fields accept typed input; time zone = property's local time
shown explicitly on deadlines `[P]`.

---

## 8. Responsive layouts (text)

| Screen group | Content priority (top first) | Wide (desk) | Narrow | Long content / text scaling |
|---|---|---|---|---|
| S-01 handoff | Unowned emergencies → unowned → past due → due today → upcoming | Table with columns: matter, home, owner, due (with provenance), status | Stacked cards, same order; filters in a sheet | Wrap text; no truncation of owner/due; 200% zoom reflows to one column [K] |
| S-13 intake | Emergency steps (if any) → home → symptoms/hazard → access → reporter | Two-column form | Single column; emergency steps pinned at top | Error summary at top |
| S-15/S-19 work order | Hazards → access/entry status → arrangement → symptoms → actions → history | Main + side panel (history) | WS-9 single column, primary action fixed at bottom but not obscuring content [P] | Arrangement text never truncated |
| S-05/S-06 home, readiness | Status/dates/possession → open items → checklist | Summary + checklist side by side | Stacked | - |
| S-24-26 ACR | Due with provenance → request → arrangement | List + detail split | List → detail navigation | - |

Supported viewports `[P]`: narrow from 320 CSS px width, wide ≥ 1024; no horizontal
scroll for content except data tables, which convert to stacked cards below a
breakpoint. Touch targets on narrow ≥ the size the accessibility target sets [K].
Compatibility assessment for PF-1/DR-11 in XDR-03.

---

## 9. Accessibility and motion (preliminary)

Target conformance level unresolved (QT-06) → XDR-06 proposes WCAG 2.2 AA `[K]`
(reviewer: accessibility reviewer named by product authority). Specified behaviours
`[P]`:

- Semantic structure: one h1 per screen; landmarks for nav, main, chrome; tables with
  headers; status badges as text.
- Accessible names for all controls including icon buttons; record-specific names
  ("Assign owner for matter M-1042").
- Keyboard: all actions reachable in DOM order matching visual order; no keyboard traps;
  dialogs trap focus and return it to the invoking control; Escape cancels dialogs
  (PAT-07 semantics on dirty forms).
- Focus: destinations per journey tables; after async success focus moves only when the
  table says so, otherwise announcement only.
- Announcements: polite live region for pending/success; assertive only for emergency
  creation, degraded service and blocking errors.
- Contrast and non-color cues: all statuses, including unknown/pending vs success, are
  distinguishable without color; contrast ratios per chosen standard [K] - token values
  pending brand (no contrast check possible yet: not_run).
- Motion: PAT-12.
- Time limits: session/coverage expiry warns before expiry with an option to extend when
  policy permits [P].

---

## 10. Tokens, components and assets (needs only; no values)

Values cannot be set without an accepted brand (G2B) - not provided.
Semantic token names needed `[P]`: `color.status.{neutral, info, success, warning,
danger, pending, unknown, restricted}`, `color.text.*`, `color.surface.*`,
`color.focus`, `space.{1..8}`, `type.{h1,h2,body,small,mono}`, `radius.*`,
`motion.{duration.short, reduced}`. Constraint: `pending` and `unknown` must not share
the `success` hue or icon.

Components needed `[P]`: app chrome (scope selector, capacity selector, coverage and
acting-for banners), matter row/card, status badge, provenance badge (PAT-09),
restricted placeholder (DS-01), checklist, error summary, conflict panel (PAT-05),
party picker (PAT-15), verification step, attachment item with classification,
audience preview panel, emergency steps panel, degraded banner, confirmation dialog.

Assets: none required beyond brand identity assets (logo/product name), which are
Branding-owned and absent; no illustration assets proposed. Asset manifest empty;
producer/readiness unassigned → missing for G2E.

---

## 11. Proposed operation needs and interaction-operation map

No architecture revision exists; every `OP-*` is a **proposed need** `[P]` for
Architecture, not an API contract. Common needs on every write: scope + capacity +
acting-for principal; idempotency key (PAT-02); record version for conflict (PAT-05);
error classes listed below; audit fields (CCR-32).

Proposed error classes for UI mapping: `validation` (field-level), `denied` (in-scope
verb missing; includes capacity that could act), `not_available` (out-of-scope or
missing; indistinguishable - XDR-08), `blocked_rule` (list of unmet conditions),
`policy_missing` (policy type, property, owner), `conflict` (current version summary,
actor, time), `duplicate` (original reference), `unknown_outcome`, `unavailable`.

| IX | Interaction | Proposed OP | Requirement trace | UI response on success / errors | Local-only? |
|---|---|---|---|---|---|
| IX-01 | Load handoff | OP-HANDOFF-LIST | UC-01, AS-01-01/03/05 | list / PAT-06 | no |
| IX-02 | Assign owner | OP-MATTER-ASSIGN | CCR-11 | J-01 #6-8 | no |
| IX-03 | Handoff entry | OP-HANDOFF-ENTRY-CREATE | AS-01-02 | J-02 | no |
| IX-04 | Record returned outcome | OP-HANDOFF-OUTCOME-RECORD | AS-01-02 | J-02 #5 | no |
| IX-05 | Sort/filter lists | - | CCR-03 | local only; allowed keys PAT-14 | **yes** (if data volume permits; else OP param) |
| IX-06 | Duplicate candidates | OP-WO-DUPLICATE-CANDIDATES | CCR-27, AS-15-04 | J-03 #3 | no |
| IX-07 | Create / link repair | OP-WO-CREATE, OP-WO-LINK-REPORT | UC-15 | J-03 #5, #9 | no |
| IX-08 | Triage | OP-WO-TRIAGE | AS-15-02/03 | J-03 #7 | no |
| IX-09 | Entry requirements | OP-ENTRY-REQUIREMENTS | CCR-14, CCR-07 | J-04 #1, #3 policy_missing | no |
| IX-10 | Record entry notice | OP-ENTRY-NOTICE-RECORD | AS-16-01 | J-04 #2 | no |
| IX-11 | Emergency entry | OP-ENTRY-EMERGENCY-RECORD | AS-16-02, CCR-31 | J-04 #4 | no |
| IX-12 | My jobs | OP-MYJOBS-LIST, OP-WO-READ | UC-16 | J-05 #1-2 | no |
| IX-13 | Status/labour/materials | OP-WO-STATUS-UPDATE, OP-WO-LABOUR-ADD, OP-WO-MATERIAL-ADD, OP-WO-OUTSTANDING-ADD | AS-16-04 | J-05 | no |
| IX-14 | Photo upload | OP-ATTACHMENT-UPLOAD | DC-17, DS-12 | J-05 #5 | no |
| IX-15 | Complete / verify | OP-WO-COMPLETE, OP-WO-VERIFY | AS-16-04/05 | J-05 #7-8 blocked_rule | no |
| IX-16 | Unusable home | OP-WO-UNUSABLE-FLAG | AS-16-06 | J-05 #9 | no |
| IX-17 | Dispatch / confirm | OP-DISPATCH-CREATE, OP-DISPATCH-CONFIRM | UC-19, CCR-26 | J-06 | no |
| IX-18 | Resident informed | OP-RESIDENT-NOTIFY-RECORD | AS-19-02 | J-06 #6 | no |
| IX-19 | Readiness item / mark ready | OP-READINESS-ITEM-UPDATE, OP-HOME-MARK-READY | AS-02-02/03/05 | J-07 | no |
| IX-20 | Availability dates | OP-AVAILABILITY-UPDATE, OP-AVAILABILITY-CONFIRM | AS-02-04, CCR-06 | J-07 #4-5 | no |
| IX-21 | Referral | OP-ACC-REFERRAL-CREATE | AS-09-01-03 | J-08 #3 | no |
| IX-22 | ACR queue / acknowledge | OP-ACC-QUEUE, OP-ACC-ACKNOWLEDGE | AS-09-04 | J-08 #4-5 | no |
| IX-23 | Publish arrangement | OP-ACC-ARRANGEMENT-PUBLISH | AS-09-05 | J-08 #8 | no |
| IX-24 | Audience preview | - | DS-06 | local render from draft + audience rules (rules must come from server) | partly |
| IX-25 | Handover | OP-HANDOVER-START, OP-CONDITION-RECORD-CREATE, OP-CHANNEL-CONFIRM, OP-HANDOVER-COMPLETE | UC-11 | J-09 | no |
| IX-26 | Discrepancy | OP-CONDITION-DISCREPANCY-ADD | AS-11-02 | J-09 #7 | no |
| IX-27 | Authority verification | OP-AUTHORITY-VERIFY, OP-DISCLOSURE-VERIFY | AS-27-01, AS-29-01 | J-10, J-13 | no |
| IX-28 | Credentials | OP-CREDENTIAL-ISSUE, OP-CREDENTIAL-REVOKE | UC-27, CCR-15 | J-10 | no |
| IX-29 | Move-out / possession | OP-MOVEOUT-NOTICE-RECORD, OP-POSSESSION-CONFIRM | UC-33 | J-11 | no |
| IX-30 | Turnover / space release | OP-TURNOVER-START, OP-SPACE-RELEASE, OP-TURNOVER-COMPLETE | UC-35 | J-12 | no |
| IX-31 | Route matter | OP-MATTER-CREATE | AS-27-02, AS-33-03 | J-10 #3, J-11 #3 | no |
| IX-32 | Capacity | OP-SESSION-CAPACITIES, OP-SESSION-CAPACITY-SET | CAP-1 | J-14 | no |
| IX-33 | Offboard / revoke sessions | OP-USER-OFFBOARD, OP-USER-SESSIONS-REVOKE, OP-INCIDENT-CREATE | AS-27-03, AS-29-03 | J-10 #6, J-16 | no |
| IX-34 | Service status | OP-SERVICE-STATUS | QT-05 | J-15 | no |
| IX-35 | Policy versions read | OP-POLICY-VERSION-READ | CCR-07, DC-37 | PAT-16 | no |
| IX-36 | Unsaved-data prompt, form drafts | - | - | PAT-07 | **yes** |

Architecture revision: none. These rows must be re-pinned to an exact
`architecture_package` revision before cross-review.

---

## 12. User-outcome signal needs

Observation needs for Architecture to bind; no events or schemas are defined here.
Privacy constraint on all: no names, household identifiers, free text, accommodation
or complaint content; scope-level aggregates only; restricted-category signals are
counted only within the authorized reporting capacity `[P]`.

| ID | Journey / outcome | Observation needed | Interpretation | Threshold ref |
|---|---|---|---|---|
| UOS-01 | J-01 nothing disappears | Open matters without owner at handoff time, per property per day | Lower is better; trend vs unknown baseline | QT-07 (unresolved) |
| UOS-02 | J-02 promises kept | Handoff promises past date without returned outcome | Process gap indicator | none (XI-06) |
| UOS-03 | J-03 emergency ownership | Time from emergency record to immediate-action owner assigned | Responsiveness | none; needs authority |
| UOS-04 | J-05 repair completion | Completion vs CT-01 target by priority category | QT-08 | QT-08/CT-01 (unresolved) |
| UOS-05 | CCR-03 fairness | Priority distribution independent of balance status (computed server-side, never exposed per household) | Fairness check for UC-36 | none; Requirements to confirm |
| UOS-06 | PAT-03 unknown outcomes | Count and age of unreconciled unconfirmed/unknown statuses | Reconciliation backlog | none |
| UOS-07 | PAT-04 denials | Denied/blocked/policy_missing occurrences by type | Mis-assigned permissions or missing policies | none |
| UOS-08 | J-08 acknowledgement | Referral → acknowledgement elapsed vs CT-03/legal | Timeliness | CT-03 (unresolved) |
| UOS-09 | Task completion / abandonment | Started vs completed for intake, handover, possession forms | Usability signal; not a usability test | none |

---

## 13. Requirement map (provisional)

| Req (provisional) | Journey | Screens / patterns | Operation needs | Verification consideration | Signal |
|---|---|---|---|---|---|
| UC-01 | J-01, J-02 | S-01-03, PAT-09 | OP-HANDOFF-*, OP-MATTER-ASSIGN | Scope leakage (AS-01-05), restricted rows (AS-01-03), degraded (AS-01-04) | UOS-01/02 |
| UC-02 | J-07 | S-04-07, PAT-13 | OP-READINESS-*, OP-HOME-MARK-READY, OP-AVAILABILITY-* | Mark-ready negative (AS-02-02), anticipated vs confirmed | - (justified: state correctness checked by tests) |
| UC-09 (P1 part) | J-08 | S-23-26, DS-01/06 | OP-ACC-* | Disclosure per audience; no fee control; arrangement-only views | UOS-08 |
| UC-11 (P1 part) | J-09 | S-08, S-09, S-21 | OP-HANDOVER-*, OP-CONDITION-*, OP-CREDENTIAL-ISSUE | Unsafe-but-paid negative (AS-11-03), partial issuance | UOS-09 |
| UC-15 | J-03 | S-13, S-14, PAT-14 | OP-WO-CREATE/LINK/TRIAGE/DUPLICATE-CANDIDATES | Fairness (AS-15-03), duplicate (AS-15-04), unknown outcome | UOS-03/05 |
| UC-16 | J-04, J-05 | S-15, S-16, S-18, S-19 | OP-ENTRY-*, OP-WO-* | Policy-missing block, single-visit authorization, can't close with outstanding | UOS-04 |
| UC-19 | J-06 | S-17 | OP-DISPATCH-*, OP-RESIDENT-NOTIFY-RECORD, OP-CREDENTIAL-REVOKE | Vendor preview content; unconfirmed ≠ scheduled | UOS-06 |
| UC-27 | J-10 | S-21, S-22 | OP-AUTHORITY-VERIFY, OP-CREDENTIAL-* | Disputed household routing; no self-help revocation | UOS-07 |
| UC-29 (access) | J-13, J-16 | S-22, S-27, DS-* | OP-DISCLOSURE-VERIFY, OP-USER-SESSIONS-REVOKE | Recipient verification before disclosure; restricted search | UOS-07 |
| UC-33 (P1 part) | J-11 | S-10, S-11 | OP-MOVEOUT-*, OP-POSSESSION-CONFIRM | "Looks empty" refused (AS-33-02) | - (justified: rule test) |
| UC-35 | J-12 | S-12 | OP-TURNOVER-*, OP-SPACE-RELEASE | Space release blocked (AS-35-02) | - |
| CCR-01/03/13 | J-03, PAT-14 | no prohibited fields/sorts | - | Field inventory review; fairness case | UOS-05 |
| CCR-05/06 | J-07, J-09, J-11 | PAT-13 | - | Label inspection | - |
| CCR-07 | J-04, J-08, J-09 | PAT-16 | OP-POLICY-VERSION-READ | Blocked-not-defaulted cases | UOS-07 |
| CCR-09, ACTORS §3.2 | all | DS-01-17 | server-side filtering | Disclosure matrix §5.2 per surface | - |
| CCR-11 | J-01-03 | S-01 | - | Unowned surfacing | UOS-01 |
| CCR-14 | J-04 | S-16 | OP-ENTRY-* | Single-visit | - |
| CCR-15 | J-10, J-11 | S-11, S-21 | OP-CREDENTIAL-REVOKE, OP-POSSESSION-CONFIRM | Refusals | - |
| CCR-20/PF-6 | J-09, PAT-11 | S-20 | OP-CHANNEL-CONFIRM | Non-portal resident path | - |
| CCR-25 | all | global chrome | all reads | No cross-scope in lists/counts/search/notifications | - |
| CCR-26/27 | J-03, J-06 | PAT-02/03 | idempotency | Duplicate and unknown outcome cases | UOS-06 |
| CCR-28 | J-03, J-08 | PAT-09 | - | Provenance labels | - |
| CCR-32/CAP-1/2 | J-14 | global chrome, PAT-10 | OP-SESSION-* | No merged permissions; expiry | - |
| QT-05 | J-15 | S-31 | OP-SERVICE-STATUS | Degraded behaviour | - |
| QT-06 | all | §9 | - | Accessibility audit once target set | - |
| UC-03-08, 10, 12-14, 17, 18, 20-26, 28, 30-32, 34, 36-39 | outline | S-40-S-70 | not yet proposed | Full journeys needed if in scope (DR-01) | - |

---

## 14. Options, limitations, risks

### 14.1 Compatibility assessment (answers sought by intake)

| Question | Assessment | Tag |
|---|---|---|
| Can Option A be served by the web-app-v1 profile's browser UI? | Yes for desk staff. Technician field use is feasible as a responsive narrow-screen web workspace (WS-9) **with connectivity**; offline capture is not supported by the profile and would be a platform change (XDR-03). | [P] |
| Are disclosure rules implementable in UI? | Presentation yes, but only if Architecture filters server-side (lists, search, counts, notifications) and offers the `not_available` class; UI hiding alone is insufficient. | [D] CCR-09/25; [P] |
| Can P1 run without jurisdiction decisions? | Partly. Non-emergency entry into occupied homes (UC-16), move-in discrepancy window (UC-11), and accommodation decisions are CCR-07-gated; under "blocked, not defaulted" P1 maintenance in occupied homes is blocked until a reviewed entry policy exists (XDR-02). | [D] CCR-07 |
| Residents without portal | Supported by staff-entered records with channel (PAT-11). | [D] PF-6 |

### 14.2 Risks

| ID | Risk | Impact | Mitigation / route |
|---|---|---|---|
| XR-01 | Restricted matter existence leaks via handoff rows, counts or household label | Disability/complaint inference by staff without need-to-know | DS-01, XDR-01; Testing derives leakage cases |
| XR-02 | Entry-notice gate blocks core maintenance | Pilot unusable for occupied homes | XDR-02 |
| XR-03 | Technicians lose work on poor connectivity | Missing labour/evidence, re-entry | J-05 #10 explicit unsaved state; XDR-03 |
| XR-04 | Arrangement text authored with medical detail | Disclosure via honour text | J-08 #7 guidance + preview; possible review step (XDR-05) |
| XR-05 | "Unconfirmed" statuses accumulate unreconciled | False sense of scheduled work | S-01 surfacing, UOS-06 |
| XR-06 | No brand; provisional copy may diverge | Rework at G2B | XDR-09; copy keys C-* kept centralised |
| XR-07 | Capacity switching friction for small-office staff holding many capacities | Workarounds (one "super" capacity) that violate CAP-1 | Chooser remembers last capacity per device [P]; never merged |
| XR-08 | Back-entry after outage creates duplicates or misleading timestamps | Audit/record integrity | J-15 #4 original time + "entered late"; duplicate linking |
| XR-09 | Preliminary model treated as design baseline | Implementation before G2 | Envelope and §0 label; Coordinator gating |

### 14.3 Limitations

- Derived only from unaccepted drafts; any G1 change invalidates affected rows.
- No narrative read; nuance lost in Requirements summarisation cannot be checked here.
- No architecture peer draft: operation needs, error classes and concurrency are
  proposals; no cross-review performed.
- No visuals, no Figma, no wireframes, no token values, no contrast evaluation.
- No usability evidence; UOS-09 is a future signal, not evidence.
- P2/P3/L journeys outlined only.

---

## 15. Decision requests

Each follows contract §3 `decision_request`. Proposed owner shown; routed via Coordinator.

**XDR-01 Restricted-matter visibility in shared lists** (category `intent_ambiguity`;
owner: product authority via Requirements; affected: AS-01-03, DS-01, S-01, S-14, S-20).
Question: what may non-authorized staff see of an accommodation (or similar restricted)
matter in the handoff and other lists? Explanation: AS-01-03 shows "accommodation
matter - owner ACT-ACR"; the label alone tells a leasing agent that the household at
Home 4B has made a disability-related request. Options: (a) as drafted - type visible,
content hidden: simple, discloses existence/type; (b) "Restricted matter" with owner
capacity, due date and home label - hides type, still reveals that something restricted
exists for that home; (c) restricted matters appear only in the owner's and PM's lists,
with no row for others - strongest privacy, but other staff can't see that a deadline
exists. Recommendation: (b) for PM and the owner, (c) for everyone else. Consequence
of deferral: DS-01 stays proposed; S-01 cannot be finalised; Testing cannot derive
leakage cases.

**XDR-02 Entry authorization while no reviewed entry-notice policy exists** (category
`intent_ambiguity` with legal review; owner: product authority + counsel reviewer
(DR-10); affected: UC-16, CCR-07, CCR-14, J-04, DR-01 Option A basis). Question: can
P1 support non-emergency entry into occupied homes before a jurisdiction policy is
reviewed? Explanation: CCR-07 blocks steps lacking a reviewed value; entry notice is
such a value, so a technician can't fix a dripping tap in an occupied home unless it is
an emergency. Options: (a) keep blocked until DR-02/DR-10 (no defaults; pilot limited to
vacant homes and emergencies); (b) allow a "resident-authorized visit" basis (resident
agrees to a specific visit, recorded with time and channel; single-visit per AS-16-03)
- legal sufficiency is `[K]` and needs counsel review; (c) select pilot jurisdiction now
(DR-02 (a)). Recommendation: (c), with (b) only if counsel confirms. Consequence of
deferral: J-04 row 3 blocks most routine repairs; Option A's "fewer jurisdiction
dependencies" basis is weaker than stated.

**XDR-03 Field use and connectivity** (category `missing_capability` candidate;
owner: product authority + platform authority, Architecture input; affected: DR-11,
PF-1, WS-9, J-05). Question: is connected narrow-screen browser use sufficient for
technicians, or is offline capture required? Explanation: a technician in a basement
with no signal can't save labour or photos; under the profile, entries remain only on
screen. Options: (a) connected-only responsive web (fits profile; risk XR-03); (b)
offline capture with later sync (profile departure: needs ADR and platform authority;
adds conflict and duplicate complexity); (c) technicians report to lead who records at
desk (no field UI; slower, transcription errors). Recommendation: (a) for the pilot, measure
UOS-09/XR-03, revisit. Deferral: WS-9 remains provisional.

**XDR-04 Degraded-operation fallback** (owner: product authority; affected: QT-05,
J-15, DS-11, S-31). Question: what do staff use when the application is unavailable
for emergency intake, emergency contacts/access notes and key verification?
Explanation: if staff print an emergency-contacts sheet in advance, the sheet is a
disclosure surface that can be lost. Options: (a) paper intake forms only, no
pre-printed data; (b) periodic access-controlled printed/exported essential sheet
(DS-11 footer, retention rule); (c) external answering service holds data. Recommendation:
(a) plus a minimal (b) limited to access notes without names, pending threshold
consistency with QT-01/02. Deferral: J-15 row 3 unspecified; threshold consistency check
cannot run.

**XDR-05 Arrangement-to-honour wording and review** (owner: product authority with the
designated ACR (DR-12); affected: AS-09-05, DS-06, J-08). Question: may the arrangement
shown to technicians name the category (e.g. "assistance animal") and should published
text get a second review? Explanation: "Assistance animal in home - don't separate from
resident" tells the technician the resident has a disability-related need; "Animal in
home - do not separate from resident; approved" may suffice. Options: (a) category
label allowed; (b) neutral operational wording only, enforced by guidance + preview
(J-08 #7); (c) (b) plus PM review before publication. Recommendation: (b). Deferral:
J-08 #7-8 provisional.

**XDR-06 Accessibility conformance target** (owner: product authority; reviewer:
accessibility reviewer; affected: QT-06, §8-9, PAT-12). Question: which standard and
level? Recommendation: WCAG 2.2 AA `[K]`. Explanation: without a target, contrast, target
size and reflow checks can't pass or fail. Options: 2.1 AA / 2.2 AA / AA plus specific
AAA items. Deferral: accessibility checks remain not_run; G2E cannot pass.

**XDR-07 Staff notification channel** (owner: product authority; Architecture input;
affected: DS-07). Question: in-app only, browser notifications, or email? Explanation:
an email "Repair needs your attention - Home 4B" on a personal phone's lock screen is
low risk; "Accommodation request due" would not be. Options and recommendation: in-app
plus optional email with DS-07 minimal content. Deferral: DS-07 wording provisional.

**XDR-08 Denied vs not-available presentation** (owner: product authority via
Requirements; Architecture for error semantics; affected: PAT-04, DS-17, deep links).
Question: should out-of-scope or restricted items be indistinguishable from missing
ones? Explanation: a link to a complaint about a colleague that says "You don't have
access" confirms the complaint exists. Options: (a) always distinguish (clearer, leaks
existence); (b) `not_available` for out-of-scope and restricted-category items, `denied`
only for in-scope verbs on visible items. Recommendation: (b). Deferral: PAT-04 provisional.

**XDR-09 Brand absence** (owner: Coordinator → brand authority; affected:
brand_application, tokens, copy C-*). Question: assign Branding (or confirm existing brand
constraints) so Experience can produce a brand application map. Explanation: without
it, product name, voice in sensitive contexts and colour tokens are unbound. Options:
assign Branding after G1; adopt a neutral internal-tool brand by authority decision.
Recommendation: assign Branding after G1. Deferral: G2E impossible.

### 15.1 Issues routed to other owners (not decisions)

| ID | Category | Issue | Evidence | Route |
|---|---|---|---|---|
| XI-01 | intent_ambiguity | AS-01-03 display text names actor ID "ACT-ACR"; real UI needs a capacity display name decision (and XDR-01) | use-cases AS-01-03 | Requirements |
| XI-02 | intent_ambiguity | Option A basis states fewer jurisdiction dependencies, but UC-16 entry notice is CCR-07-gated (see XDR-02) | UC-16 AS-16-01 "(L)"; §7 Option A | Requirements |
| XI-03 | intent_ambiguity | AS-11-02 "within allowed window": window value is configuration (CCR-07) but not listed under L for UC-11 | UC-11 | Requirements |
| XI-04 | intent_ambiguity | AS-02-04 contacts "prospects/applicants linked to the home", but prospects/applications (UC-05/07) are outside Option A; source of linked people in P1 undefined | UC-02, §7 | Requirements |
| XI-05 | intent_ambiguity | AS-09-07 depends on enforcement matters (UC-31/32) excluded from first slice; behaviour in P1 undefined | UC-09, §7 exclusions | Requirements |
| XI-06 | intent_ambiguity | Small-cell suppression threshold for owner aggregates and promise-overdue signals have no source value | ACTORS §3.2 counts | Requirements (DR-08/DR-13) |
| XI-07 | architecture_conflict candidate | Session timeout / shared-device behaviour (DS-10) needs security policy | DS-10 | Architecture |
| XI-08 | contract_conflict candidate | Error classes, idempotency and version semantics proposed in §11 must be reconciled with Architecture once drafted | §11 | Architecture + Experience via Coordinator |
| XI-09 | intent_ambiguity | Permission matrix gives RSS "V E" on work orders but not triage; confirm RSS may create but not prioritise | ACTORS §3.1 | Requirements (DR-06) |
| XI-10 | missing input | run_manifest not supplied to this task; authorities and limits unverifiable here | assignment | Coordinator |

---

## 16. Self-check

| Check ID | Subject | Outcome | Evidence |
|---|---|---|---|
| EXP-C01 | Compatibility minimum: surfaces/navigation | pass | §1 |
| EXP-C02 | Screen inventory traced to requirement IDs; every UC mapped | pass | §2 coverage note |
| EXP-C03 | Journey state tables (state, trigger, guard, next state, feedback, focus) | pass for Option A working scope; P2/P3/L outlined only | §3 J-01-J-16 |
| EXP-C04 | Shared patterns | pass | §4 |
| EXP-C05 | Disclosure-surfaces checklist on every P1 screen and message | pass (static) | §5.1-5.2 |
| EXP-C06 | Failure-semantics checklist on every full journey | pass (static) | §6 |
| EXP-C07 | Threshold-consistency checklist | not_run: QT values absent; dependency recorded in XDR-04, UOS rows | §12, XDR-04 |
| EXP-C08 | Proposed operation needs; local-only interactions explicit | pass (proposals; no architecture revision) | §11 |
| EXP-C09 | Options, limitations, risks, decision_requests | pass | §14, §15 |
| EXP-C10 | Source tags on rules/terms; [K] has reviewer | pass | §0 legend; [K] in §8-9, PAT-12, DS-10, XDR-02/06 |
| EXP-C11 | No new product behaviour / policy invented | pass with flagged proposals: referrer losing visibility after referral (J-08 #3), RSS triage restriction (XI-09) are [P] for Requirements | §3, §15.1 |
| EXP-C12 | Behavioural policies presented, not relocated (permissions, ranking, eligibility) | pass: triage sort keys and denials cite CCR-03/ACTORS matrix | PAT-04, PAT-14 |
| EXP-C13 | Brand application map | not_applicable in compatibility mode (no brand); required for G2E | XDR-09 |
| EXP-C14 | Visual baseline / Figma | not_applicable in compatibility mode (not assigned); required for G2E | §0 |
| EXP-C15 | Accessibility completeness | inconclusive: behaviours specified; target and contrast not_run | §9, XDR-06 |
| EXP-C16 | Responsive behaviour | pass (text) for P1 screen groups | §8 |
| EXP-C17 | G2E/G2 not claimed | pass | envelope, §0 |
| EXP-C18 | Input hashes verified | pass: both requirement content hashes match declared | envelope |
