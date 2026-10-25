---
artifact_id: REQ-EVAL-050-01-ACTORS
type: requirements_spec            # actor-profile part of a discovery-mode draft; companion part REQ-EVAL-050-01-USECASES
part: actors
revision: r1 (draft)
status: draft                      # discovery output; cannot satisfy G1
completeness: partial
missing_fields:
  - permissions and denied actions are proposed [P] pending DR-03, DR-06, DR-12 (no product authority in this run)
  - situational variants that depend on jurisdiction/program are open pending DR-02
  - every validation question below is unanswered (no authority available)
producer_role: requirements
run_id: EVAL-050-01
task_id: R1
attempt: 1
mode: discovery
execution_mode: separate_agents
input_refs:
  - ref: rental-ops/docs/rental-property-office-operations.md
    provenance: external_baseline, provenance unknown (no identity envelope); sole product source
    sha256: 9c306ba82919d5adec697883c78e254729bb8ad455159c09da4982e28a92a636
  - ref: meta-agents/contracts/operating-contract.md (v0.5.0)
    sha256: 30b0409148efff46116c5ecc49cebbd4be5460533d2f5863fea9f410ae6e766e
  - ref: meta-agents/contracts/platform-profile.md (web-app-v1 0.5.0)
    sha256: 9169173af6eab0dcd58cf718bb0b5eeee82b0a59d02f553a4d1aface1e46dd7e
  - ref: meta-agents/agents/requirements.md (v0.5.0)
    sha256: 39d4d58a5537da6046c39650df6f1179ebf2ac9500421b4498a22c5734d81a25
  - ref: meta-agents/templates/requirements.md
    sha256: f688a0cb9c3805d59e9f025b5abeab18639c7ffc9e684dfd8bd7bb32c5a283cf
requirement_ids: []
traceability_reason: >-
  Pre-G1 discovery. No accepted requirements exist. Actor IDs (ACT-*) and the
  use-case IDs (UC-*) and rule IDs (CCR-*) in the companion artifact are
  provisional, stable candidate IDs to be carried into intake; source traceability
  is to narrative sections (N-codes below).
content_ref: /home/claude/eval05/req/personas.md (body below the BODY-START marker)
content_hash: sha256:c0346197991a3d8c0b25371097f276c6f51b6e390be0a7467a964736a47fc21f
created: 2026-10-25
---
<!-- BODY-START -->

# Actor profiles — rental property office (discovery draft)

## 0. How to read this artifact

**Source references.** The only product source is the narrative
`rental-property-office-operations.md`. It is cited as `N<section>.<paragraph>`:

| Code | Narrative section | Code | Narrative section |
|---|---|---|---|
| N1 | The office and its daily rhythm | N10 | Service providers and purchasing |
| N2 | Fair housing as a constraint | N11 | Rent, deposits, accounting, owner reporting |
| N3 | Planning inventory, rents, readiness | N12 | Parking, storage, deliveries, shared facilities |
| N4 | Advertising and responding to interest | N13 | Security, privacy, emergencies |
| N5 | Applications, screening, rental decisions | N14 | Renewals, violations, notices, eviction |
| N6 | Accommodations, modifications, assistance animals | N15 | Move-out, possession, turnover |
| N7 | Leasing and preparing for move-in | N16 | Oversight, program variations, continuity |
| N8 | Resident service and household changes | N0 | Preamble (purpose, disclaimers) |
| N9 | Repairs, preventive maintenance, capital work | N17 | Scope remaining for later discussion |

Paragraph numbers count from 1 within each section (N0.2 = the preamble's second paragraph).

**Source tags** (contract §3): `[S]` stated in the source, `[D]` derived from the
source, `[A]` authority decision (none exist in this run), `[P]` proposal awaiting
decision, `[K]` external domain knowledge needing a named reviewer. Every
statement-level bullet below carries one tag. No `[K]` content is used as a rule;
where a review prompt touches law not described in the narrative, it is marked `[K]`
with a proposed reviewer and stays a prompt.

**Discovery caveat** `[S]` N0.2: the narrative is "an illustrative operating model",
explicitly *not* requirements. These profiles describe roles in the domain so that
product authority can choose who the application serves (DR-01, DR-03 in the
companion artifact). They are not accepted actors.

**No invented people** `[D]` (role definition §4): profiles have no names,
demographics or biographies. Protected characteristics (N2.1, N2.3) never shape a
profile; where they appear below it is only as information the application must
*not* use or must protect.

**Platform fit** `[D]` platform-profile: the profile family supports authenticated
browser users with explicit roles, hierarchical tenancy scope, "acting for"
delegation, multiple capacities with explicit per-action selection (never merged
permissions), temporary coverage with an end date, and invited external participants
with item-scoped access. Mapping of each actor to these mechanisms is given in §3.
Actors who would need mobile clients, public anonymous access or integrations are
flagged for Architecture/Experience compatibility review (§4).

**Scope hierarchy used below** `[D]` N0.1, N1.3, platform-profile Tenancy: owner /
portfolio → property → building → home (unit), plus property-level spaces (parking,
storage, shared facilities). Whether the management organisation serves several
owners is open (DR-13).

## 1. Actor catalogue

| ID | Actor | Kind | Primary source |
|---|---|---|---|
| ACT-OWN | Ownership (owner or owner's representative) | Internal authority, possibly external user | N1.1, N3.1, N9.4, N11.3 |
| ACT-PM | Property manager (designated manager) | Staff | N1.1–N1.2, N2.3, N8.2, N14, N16.1 |
| ACT-LEA | Leasing staff | Staff | N1.1, N4, N5, N7 |
| ACT-RSS | Resident-service staff | Staff | N1.1, N8, N12 |
| ACT-MNL | Maintenance lead | Staff | N3.2, N9 |
| ACT-TEC | Maintenance technician | Staff | N1.1, N9.2 |
| ACT-ACC | Accounting staff | Staff | N1.1, N11 |
| ACT-AHS | After-hours / overnight coverage staff | Staff capacity | N1.2, N7.4, N16.4 |
| ACT-ACR | Accommodation reviewer (designated) | Staff capacity | N6.1–N6.4 |
| ACT-VEN | Service provider (vendor / contractor / specialist) | External participant | N1.1, N10 |
| ACT-CNS | Counsel (attorney) | External participant | N10.1, N14.4–N14.5 |
| ACT-PRS | Prospect (inquiring household member) | External person | N4.3–N4.4 |
| ACT-APL | Applicant (household applying) | External person | N5 |
| ACT-RES | Leaseholder resident | External person | N1.3, N7, N8, N11 |
| ACT-OCC | Authorized occupant (non-leaseholder), incl. live-in aide | External person / data subject | N1.3, N7.1, N8.1 |
| ACT-GUA | Guarantor | External person | N1.3, N5.4, N7.1 |
| ACT-REP | Representative (person permitted to act for a resident or applicant) | External person, "acting for" | N1.3, N6.1, N7.1 |
| ACT-EMC | Emergency contact | Data subject only | N1.3 |
| ACT-GST | Guest / temporary visitor / caregiver visitor | Data subject only | N8.1, N13.1 |
| ACT-AGY | Housing assistance agency / program administrator | External organisation | N5.2, N11.4, N16.2 |
| ACT-CRA | Consumer reporting agency / screening vendor | External organisation (system) | N5.2, N5.4 |
| ACT-ADV | Advertising provider / listing service | External organisation (system) | N4.1–N4.2 |
| ACT-PAY | Payment processor and bank | External organisation (system) | N11.2 |
| ACT-ERS | Emergency responders | External organisation | N13.4 |
| ACT-SUC | Successor management / new owner | External organisation | N16.3 |

Data-subject-only actors (ACT-EMC, ACT-GST) are recorded people who do not use the
application under any option currently in view `[D]`.

## 2. Profiles

Each profile uses the fields required by the role definition §4. "Permissions" are
domain responsibilities expressed with the contract's distinct verbs (view, edit,
propose, approve, send/execute, download/export, share); they are proposals `[P]`
unless the narrative states the boundary `[S]`. Final permission matrix: §3.

---

### ACT-OWN — Ownership

- **Purpose** `[S]` N1.1: the party the office represents; sets the financial frame.
- **Goals** `[S]` N1.1, N11.3, N16.4: accurate account of property condition and
  finances; protected funds and known obligations honoured before distributions.
- **Responsibilities** `[S]` N3.1, N9.4, N11.3: approve budgets and delegated pricing
  limits; approve larger projects; review vacancy loss, concessions, arrears,
  maintenance spending, budget variances, upcoming commitments with the manager.
- **Pressures** `[S]` N2.1, N16.1: owner preference cannot create a fair-housing
  exemption; a discriminatory owner instruction is a named training situation.
- **Permissions** `[P]`: view owner reports and aggregates for owned scope;
  approve budgets, pricing limits, capital projects, distributions.
- **Resource ownership** `[S]` N1.1, N16.3: owns the property; does not own resident
  records' confidential content.
- **Denied actions** `[D]` N2.1, N11.3, N13.3: cannot direct a rental decision on a
  protected basis; cannot draw distributions from protected funds; no access to
  accommodation supporting information or screening reports `[P]`.
- **Information boundary** `[D]` N13.3, N6.2: aggregate financial/operational data
  for owned scope; individual resident detail only where the management agreement
  requires it (open, DR-13).
- **Lifecycle variants** `[S]` N16.3: change of ownership — successor owner must not
  lose resident payment history or unresolved safety issues; former owner's access ends.
- **Situational variants** `[S]` N3.1, N16.2: subsidy agreements, rent restrictions
  and registration obligations constrain owner choices.
- **Capacity / coverage** `[D]`: may be one person or an organisation; may delegate
  approvals to ACT-PM within limits (N3.1 "delegated pricing limits").
- **Validation question**: Will ownership use the application directly (owner portal),
  or only receive reports produced by the manager?

### ACT-PM — Property manager

- **Purpose** `[S]` N1.1: balances occupancy, revenue, building condition, resident
  service and legal obligations; the designated manager and escalation decision-maker.
- **Goals** `[S]` N1.2, N16.1: every matter has an owner and follow-up date; policies
  reviewed in writing and in practice; mistakes and inconsistent treatment found.
- **Responsibilities** `[S]`: assign ownership and follow-up in the daily handoff
  (N1.2); establish rent/offer terms within owner limits (N3.1); review screening
  criteria and policy effects (N2.3, N5.3); receive routed transfers, early
  termination, special-circumstance matters (N8.2); review violations and, with
  counsel, eviction prerequisites (N14.2, N14.4); oversight reviews (N16.1);
  approve vendor extra work within limits (N10.3); review with ownership (N11.3).
- **Pressures** `[S]`: competing goals (N1.1); unexpected emergencies reshape the day
  (N1.2); legal obligations depend on unselected jurisdiction (N0.2).
- **Permissions** `[P]`: view all operational records in assigned property scope;
  approve offers, exceptions, payment plans, extra work, transfers, enforcement
  steps; assign work and follow-ups; export oversight reports.
- **Resource ownership** `[D]`: owns assignment of matters, policy versions in force
  at the property, escalation outcomes.
- **Denied actions** `[S]/[D]`: cannot approve own spending beyond owner-delegated
  limits (N3.1, N10.3) `[D]`; cannot be the sole escalation point for a complaint about
  themself (N8.3, N14.2) `[S]`; cannot issue a legal notice without the locally
  reviewed process (N14.3) `[S]`; cannot change waiting-list order as a favour (N4.5) `[S]`.
- **Information boundary** `[D]` N13.3: broad within scope, but accommodation
  supporting (medical) information only if acting as ACT-ACR (DR-12).
- **Lifecycle variants** `[S]` N16.4: staff coverage changes, change of management —
  open matters transfer to a named successor.
- **Situational variants** `[S]` N1.1: at a small property the manager may also be
  leasing, accounting or maintenance; separation-of-duty limits still apply (§3.3).
- **Capacity / coverage** `[D]` platform-profile: may hold several capacities;
  selects the capacity per action; temporary coverage has an end date.
- **Validation question**: Which approvals does the manager hold, at what limits, and
  who reviews the manager's own approvals and complaints about the manager?

### ACT-LEA — Leasing staff

- **Purpose** `[S]` N1.1: respond to prospects and administer applications and leases.
- **Goals** `[S]` N4.3, N3.1: give every prospect accurate, comparable information and
  the same effective price; keep listings current.
- **Responsibilities** `[S]`: maintain listings and correct stale availability (N4.1);
  record inquiries, tours, expressed preferences and follow-up consent (N4.3–N4.4);
  explain total costs, criteria, how to request an accommodation (N4.3); receive and
  check applications for completeness (N5.1); explain lease, addenda, disclosures,
  obtain signatures from appropriate parties (N7.1–N7.2); revise availability and
  contact affected prospects when dates slip (N3.3); run move-in handover (N7.3–N7.4).
- **Pressures** `[S]`: prospects asking about schools/neighbourhood (N4.3); slipping
  move-outs and late contractors (N1.2, N3.3); pressure to make promises maintenance
  cannot keep (N3.3).
- **Permissions** `[P]`: view inventory, effective offers, listings, prospects,
  applications in scope; edit inquiry/tour/application records; send standard
  communications; propose rental decisions (approval per DR-06).
- **Resource ownership** `[D]`: inquiry, tour and application intake records.
- **Denied actions** `[S]`: steer prospects by assumed characteristics (N4.3); quote a
  price other than the effective approved offer (N3.1) `[D]`; alter waiting-list
  position (N4.5); rely solely on an automated vendor recommendation (N5.2); decide
  an accommodation request themselves — they refer it (N6.1) `[D]`; collect irrelevant
  sensitive information (N4.4).
- **Information boundary** `[D]` N6.4, N13.3: sees accommodation *arrangement to honour*,
  not supporting information; sees screening outcomes needed to process the
  application; consumer-report access only if authorized (DR-12).
- **Lifecycle variants** `[D]` N16.4: staff departure — open applications and promised
  follow-ups re-assigned; access revoked (N13.1).
- **Situational variants** `[S]` N4.4, N7.4: prospect needs remote tour, mobility
  arrangement or alternative communication channel.
- **Capacity / coverage** `[S]` N1.1: may also act as resident-service staff at small
  properties.
- **Validation question**: Do leasing staff approve applications, or only prepare a
  recommendation for the manager?

### ACT-RSS — Resident-service staff

- **Purpose** `[S]` N1.1: handle resident questions and complaints.
- **Goals** `[S]` N8.3, N2.2: each complaint investigated, followed up and closed with
  an explanation; same service standard for every resident.
- **Responsibilities** `[S]`: lost keys, billing questions, packages, new vehicles,
  household changes, transfer requests (N8.1); log complaints (N8.3); verify authority
  before replacement keys, visitor admission, lockouts (N13.1); amenity reservations,
  closures, lost items (N12.4); recognise accommodation requests in ordinary
  language and refer them (N6.1).
- **Pressures** `[S]`: steady stream of practical requests (N8.1); neighbour disputes
  that may disguise discriminatory harassment (N8.3); disputed household relationships
  at lockout (N13.1).
- **Permissions** `[P]`: view household contact, occupancy, service and complaint
  records in scope; edit service requests and complaints; propose lease changes.
- **Resource ownership** `[D]`: service-request and complaint intake records.
- **Denied actions** `[S]`: treat a family change as a violation automatically (N8.1);
  promise a standard fee for early termination (N8.2); resolve a disputed household
  relationship by re-keying for one occupant (N13.1); handle a complaint about
  themself (N8.3) `[D]`.
- **Information boundary** `[D]`: no accommodation supporting information; ledger
  view limited to explaining balances (DR-12).
- **Lifecycle / situational variants** `[D]`: same as ACT-LEA; front-desk staff are not
  asked to resolve legal interpretation questions (N2.3) `[S]`.
- **Capacity / coverage** `[S]` N1.1: frequently combined with leasing.
- **Validation question**: Which household changes may resident-service staff record
  directly, and which require manager authorization?

### ACT-MNL — Maintenance lead

- **Purpose** `[S]` N3.2, N9.2: plan and direct maintenance, make-ready, preventive and
  capital work.
- **Goals** `[S]` N9.1, N9.3: work prioritized by safety, impact, age and resources;
  repairs verified and recurring causes found.
- **Responsibilities** `[S]`: estimate make-ready work (N3.2); triage and diagnose,
  decide on specialists (N9.2); track equipment, warranties, inspections, service
  contracts, replacement plans (N9.4); confirm readiness (N15.4).
- **Pressures** `[S]`: emergencies (N9.1), part delays and specialist availability
  (N9.3), promised move-in dates (N1.2).
- **Permissions** `[P]`: view and edit work orders, readiness, equipment in scope;
  assign technicians and vendors; propose purchases (approve within limit, DR-06).
- **Resource ownership** `[D]`: work orders, readiness checklists, equipment register.
- **Denied actions** `[S]`: prioritize by favouritism or by whether the resident owes
  money (N9.1); enter without following notice/access rules (N9.2); declare an unsafe
  home ready because rent is paid (N7.3).
- **Information boundary** `[S]` N6.4: knows the arrangement to honour (e.g. how to
  manage an approved assistance animal) without medical details; no financial balances `[D]`.
- **Lifecycle / situational variants** `[D]`: emergency mode (N13.4) changes priorities
  and access procedure.
- **Capacity / coverage** `[D]` N1.1: may also act as technician.
- **Validation question**: Does the maintenance lead approve vendor spend, and up to
  what limit?

### ACT-TEC — Maintenance technician

- **Purpose** `[S]` N1.1, N9.2: inspect and repair.
- **Goals** `[D]`: know where to go, what is wrong, access arrangements, hazards, and
  any arrangement to honour; close work with evidence.
- **Responsibilities** `[S]` N9.2–N9.3: follow entry rules; protect belongings; manage
  pets/approved assistance animals per agreed arrangement; document work without
  unnecessary photographs of private areas; record labour and materials.
- **Pressures** `[D]`: work happens on site, away from a desk (platform fit flag §4).
- **Permissions** `[P]`: view assigned work orders only; edit status, notes, labour,
  materials, photos of the defect; cannot close a work order with outstanding
  follow-up (N9.3) `[D]`.
- **Denied actions** `[D]` N13.3, N9.2: no ledger, screening or accommodation
  supporting information; entry outside the recorded access authorization.
- **Information boundary** `[D]`: assignment-scoped resident contact and access notes.
- **Lifecycle variants** `[S]` N13.1: departing staff access revoked.
- **Situational variants** `[S]` N9.2: emergency entry follows its own procedure.
- **Capacity / coverage**: may be a staff member or an equivalent vendor technician `[D]`.
- **Validation question**: Do technicians record work in the application on site, or
  does the lead record it afterwards?

### ACT-ACC — Accounting staff

- **Purpose** `[S]` N1.1, N11: collect and reconcile money.
- **Goals** `[S]` N11.1–N11.3: every household ledger is clear and traceable; protected
  funds separate; period close balances.
- **Responsibilities** `[S]`: apply payments per agreement and law (N11.1); reconcile
  receipts, settlements, deposits (N11.2); track deposit liabilities, interest,
  deductions, refunds (N11.2, N15.3); vendor bills and invoice matching (N10.3, N11.3);
  verify missed payments before action (N11.4); independently verify vendor
  payment-detail changes (N10.3).
- **Pressures** `[S]`: pending/misapplied/disputed/agency-expected payments (N11.4);
  payment fraud (N13.3).
- **Permissions** `[P]`: edit ledger entries in scope; approve refunds and
  adjustments within limits; export financial reports.
- **Denied actions** `[S]/[D]`: both request and verify the same vendor
  payment-detail change (N10.3, N1.1 "checking financial transactions") `[D]`; post
  owner distributions that consume protected funds (N11.3) `[S]`; generate an eviction
  notice from a balance flag (N11.4) `[S]`.
- **Information boundary** `[S]` N6.4: knows financial effect of an accommodation
  (e.g. no pet charge) without medical details.
- **Lifecycle / situational variants** `[S]` N16.2: assisted housing — agency share and
  resident share kept distinct.
- **Capacity / coverage** `[S]` N1.1: may be combined with other roles; transaction
  checking must still be performed by someone else (§3.3).
- **Validation question**: Is accounting performed in this application, or in an
  external accounting system fed by it (DR-04)?

### ACT-AHS — After-hours / overnight coverage

- **Purpose** `[S]` N1.2, N7.4: receive emergencies and messages outside office hours.
- **Goals** `[S]` N16.4: leave a usable handoff — what happened, who was contacted,
  what was promised, what remains, who acts next.
- **Permissions** `[P]`: create emergency work orders and incident records; view
  emergency contacts and access notes for affected homes; cannot change leases or ledgers.
- **Denied actions / information boundary** `[D]`: no screening, accommodation
  supporting information or ledger details; evacuation needs visible without
  diagnosis (N13.4) `[S]`.
- **Capacity / coverage** `[D]` platform-profile: often a capacity held temporarily
  by other staff (coverage with an end date) or an outside answering service (open).
- **Validation question**: Is after-hours coverage staffed by employees, a vendor, or
  both?

### ACT-ACR — Accommodation reviewer

- **Purpose** `[S]` N6.1–N6.2: give requests prompt, individualized consideration.
- **Responsibilities** `[S]`: acknowledge; seek only information needed for a
  non-apparent disability-related need; discuss effective alternatives; record outcome
  and the arrangement other staff must honour (N6.2, N6.4).
- **Pressures** `[S]`: requests may arrive during enforcement (N6.1); assistance-animal
  guidance currently uncertain (N6.4).
- **Permissions** `[P]`: sole view of supporting information; approve/deny/propose
  alternative; publish the honour-able arrangement.
- **Denied actions** `[S]`: charge for a request (N6.2); require legal vocabulary or a
  form before referral (N6.1); decide using a generic pet-fee schedule or an online
  certificate (N6.4).
- **Information boundary** `[S]` N6.2: supporting information protected from
  unnecessary disclosure.
- **Capacity** `[D]`: a designated capacity, probably held by ACT-PM or a named delegate (DR-12).
- **Validation question**: Who is designated to review accommodation requests, and
  who may see supporting documentation?

### ACT-VEN — Service provider

- **Purpose** `[S]` N10.1: perform services the office cannot.
- **Goals** `[D]`: clear scope, access, completion evidence, payment.
- **Responsibilities** `[S]` N10.1–N10.2: perform contracted scope; respect resident
  conduct and confidentiality terms; provide completion evidence.
- **Permissions** `[P]` platform "invited external participant with item-scoped access":
  if given access at all (DR-03), view only the assigned job's needed details;
  update job status/evidence; submit invoices.
- **Denied actions** `[S]` N10.2, N12.2: no broad access to financial or accommodation
  files; towing contractor does not decide eligibility; extra work only with approval
  (N10.3).
- **Lifecycle variants** `[S]` N13.1, N15.4: vendor access and permissions revoked at
  job/contract end; insurance expirations tracked (N10.3).
- **Situational variants** `[S]` N10.2: subject of a conduct complaint (harassment,
  discrimination, unsafe work, unauthorized entry).
- **Validation question**: Should vendors use the application (job links, invoices),
  or are they managed entirely by staff?

### ACT-CNS — Counsel

- **Purpose** `[S]` N14.4–N14.5: review prerequisites and conduct court matters.
- **Permissions** `[P]` invited participant, matter-scoped: view preserved ledger,
  lease, correspondence, evidence; record review outcome, hearings, orders.
- **Denied actions** `[D]`: no access outside assigned matters.
- **Validation question**: Should counsel receive matter packages through the
  application, or by export only?

### ACT-PRS — Prospect

- **Purpose / goals** `[S]` N4.3: learn about available homes, total costs, process, how
  to request help; decide what fits.
- **Pressures** `[S]` N4.4: mobility needs, remote participation, office hours.
- **Permissions** `[P]` (if self-service, DR-03): submit inquiry; book tour; manage
  follow-up consent; join waiting list.
- **Denied actions** `[D]`: see other prospects, waiting-list identities.
- **Information boundary** `[S]` N4.4: only preferences and consent recorded; no
  irrelevant sensitive information.
- **Lifecycle variants** `[S]` N4.5: waiting-list entrant; withdrawn; converts to ACT-APL.
- **Validation question**: Should prospects interact with the application directly, or
  only through staff?

### ACT-APL — Applicant household

- **Purpose / goals** `[S]` N5.1–N5.2: be evaluated under published criteria; understand
  fees, decision and rights.
- **Responsibilities** `[S]` N5.1: supply needed information and permissions.
- **Permissions** `[P]` (DR-03): submit application, see completeness status, supply
  corrections to disputed screening results (N5.2), withdraw.
- **Denied actions** `[D]`: view other applicants; see vendor scores without the
  explanation (N5.2) — open.
- **Situational variants** `[S]` N5.2, N5.4, N16.2: subsidy changes own payment
  obligation; alternative evidence of qualification; adverse action (incl. larger
  deposit or guarantor requirement) triggers notice; covered-program survivor
  protections.
- **Lifecycle variants** `[S]`: incomplete, duplicate, simultaneous, withdrawn, approved,
  denied, approved with conditions; holding payment held (N5.1).
- **Validation question**: Which co-applicants (adults? guarantors?) are separate
  applicants with their own consent and adverse-action notice?

### ACT-RES — Leaseholder resident

- **Purpose** `[S]` N1.3: party responsible for the lease.
- **Goals** `[S]` N16.4: understand obligations, consistent service, maintained home,
  documented resolution.
- **Responsibilities** `[S]` N7.1, N15.1: pay per agreement; give notice; return keys.
- **Permissions** `[P]` (DR-03): report repairs/emergencies, view statement and
  receipts, challenge errors (N11.1), receive notices, request accommodations, raise
  complaints including about staff (N8.3), reserve amenities.
- **Denied actions** `[D]`: view other households' records; authorize lease changes
  alone where co-leaseholders must consent (N8.1, open).
- **Information boundary** `[D]`: own household's lease, ledger, requests, notices.
- **Lifecycle variants** `[S]` N15, N14: applicant → resident → renewing →
  departing → **former resident** (deposit disposition, balances, records retained,
  access revoked, N13.1, N15.3–N15.4); deceased or incapacitated resident (N8.2, N15.2).
- **Situational variants** `[S]`: military service (N8.2, N14.4); survivor of domestic
  violence (N8.2, N16.2); assisted household (N16.2); pending accommodation or dispute
  during enforcement (N14.4); cannot use standard communication or payment channel (N7.4).
- **Capacity / coverage** `[S]` N1.3: may authorize a representative (ACT-REP).
- **Validation question**: Which channels must residents be able to use (portal,
  phone, paper), and must the application support non-portal residents equally?

### ACT-OCC — Authorized occupant / live-in aide

- **Purpose** `[S]` N1.3, N8.1: lives in the home under the lease without being a
  leaseholder.
- **Permissions** `[P]`: may report repairs; may not change lease or ledger.
- **Situational variants** `[S]` N15.2, N14.5: remaining occupant after a leaseholder
  leaves or dies requires separate review.
- **Validation question**: May authorized occupants receive keys/credentials and
  report repairs independently?

### ACT-GUA — Guarantor

- **Purpose** `[S]` N7.1: assumes explicit financial obligation.
- **Information boundary** `[D]`: obligation-related information only, not household
  service history.
- **Situational variant** `[S]` N5.4: required guarantor can be adverse action.
- **Validation question**: What may a guarantor view or receive (statements, notices)?

### ACT-REP — Representative

- **Purpose** `[S]` N1.3, N6.1: acts for a resident or applicant, including making an
  accommodation request.
- **Mechanism** `[D]` platform "acting for" delegation with scope and validity.
- **Denied actions** `[D]`: act beyond recorded scope or after validity ends.
- **Validation question**: What evidence and scope must be recorded before staff act on
  a representative's instruction?

### ACT-EMC, ACT-GST — Emergency contact; guest/visitor

- Recorded people only `[S]` N1.3, N8.1; contact used for the recorded purpose `[D]`;
  guests distinguished from occupants and live-in aides (N8.1) `[S]`; visitor admission
  requires authority verification (N13.1) `[S]`.
- **Validation question**: Are visitors recorded at all (e.g. visitor parking permits)?

### ACT-AGY — Housing assistance agency

- `[S]` N16.2, N11.4: certifications, subsidy payments, inspections, rent approvals,
  program notices; delayed agency payment kept distinct from resident's unpaid share.
- Interaction: external organisation; integration not assumed (DR-05).

### ACT-CRA, ACT-ADV, ACT-PAY, ACT-ERS — External systems and organisations

- ACT-CRA `[S]` N5.2, N5.4: supplies reports; does not make the rental decision; named
  in adverse-action notices.
- ACT-ADV `[S]` N4.1–N4.2: listing channels; audiences/exclusions reviewed.
- ACT-PAY `[S]` N11.2: settlements reconciled.
- ACT-ERS `[S]` N13.4: contacted in emergencies.
- Integration of each is open (DR-05). Unknown outcomes from these parties must never
  be displayed as success (CCR-26).

### ACT-SUC — Successor management / new owner

- `[S]` N16.3: receives leases, balances, protected funds, keys, vendor contracts, open
  repairs, accommodation arrangements, pending notices with authority and privacy
  controls. Interaction: export/transfer package (UC-39).

## 3. Permission matrix, separation of duties and capacity rules

### 3.1 Proposed permission matrix `[P]` (pending DR-03, DR-06, DR-12)

Scope column applies to every cell: permissions apply only within the actor's assigned
property scope (CCR-25). V=view, E=edit, Pr=propose, Ap=approve, S=send/execute,
X=download/export, Sh=share. "—" denied. "A" = arrangement only (no supporting details).

| Resource | OWN | PM | LEA | RSS | MNL | TEC | ACC | AHS | ACR | VEN | CNS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Inventory / readiness | V | V E Ap | V | V | V E | V (assigned) | V | V | — | — | — |
| Offers / pricing | Ap (limits) | V E Ap (≤ limit) | V | V | — | — | V | — | — | — | — |
| Listings | V | V Ap | V E S | — | — | — | — | — | — | — | — |
| Prospects / tours / waiting list | — | V | V E | V | — | — | — | — | — | — | — |
| Applications | — | V Ap | V E Pr | — | — | — | V (fees) | — | — | — | — |
| Consumer reports | — | V (DR-12) | V (DR-12) | — | — | — | — | — | — | — | — |
| Accommodation supporting info | — | — (unless ACR) | — | — | — | — | — | — | V E | — | — |
| Accommodation arrangement | — | V | A | A | A | A (assigned) | A | A | V E Ap S | A (job-scoped) | — |
| Leases | V (aggregate) | V Ap | V E Pr S | V Pr | — | — | V | — | — | — | V (matter) |
| Household ledger | aggregate | V Ap | V (balance) | V (balance) | — | — | V E Ap X | — | — | — | V (matter) |
| Protected funds / deposits | V | V Ap | — | — | — | — | V E | — | — | — | — |
| Work orders | V | V E Ap | V | V E | V E Ap | V E (assigned) | V (cost) | V E | — | V E (job) | — |
| Vendors / contracts / payment details | V | V Ap | — | — | V Pr | — | V E (verify) | — | — | own job only | — |
| Complaints | — | V E Ap | V (own intake) | V E | — | — | — | V E (intake) | — | — | — |
| Violations / notices / legal matters | — | V E Ap S | — | — | — | — | V | — | — | — | V E |
| Owner reports / distributions | V Ap | V E Pr X | — | — | — | — | V E X | — | — | — | — |
| Audit log | — | V | — | — | — | — | — | — | — | — | — |

External persons (PRS, APL, RES, OCC, GUA, REP) see only their own items, if a
self-service channel is chosen (DR-03).

### 3.2 Disclosure surfaces (contract §3 checklist applied to actors) `[D]`

The information boundaries above must hold on every surface, not only detail views:

| Surface | Rule | Source |
|---|---|---|
| Lists, search, suggestions | Accommodation, disability, survivor-status, screening data never appear as list columns, search hits, or autocomplete for actors without view permission | N6.2, N13.3, N13.4 |
| Counts / dashboards | Counts of accommodation requests or legal matters are visible only to actors who may see them; aggregates for ownership must not allow re-identification of a single household in small scopes `[P]` | N13.3 |
| Breadcrumbs / previews | Work-order previews show the arrangement to honour, never the reason | N6.4 |
| Attachments | Supporting documents, consumer reports, ID documents, photos of private interiors have their own access control separate from the parent record | N5.2, N9.2, N13.3 |
| Messages / notifications | Lock-screen or shared-device notifications to staff and residents carry no sensitive content (no balances, no medical, no legal-stage details) `[P]`; vendor messages carry only job information | N10.2, N13.3 |
| Exports and print | Exports respect the same scope and field-level boundaries; counsel/successor packages are explicit, authorized, logged | N16.3, N14.3 |
| Recipient selection | Before disclosing, staff verify the recipient is authorized (resident, representative within scope, guarantor for obligation info) | N13.3, N1.3 |
| Emergency lists | Evacuation/access needs available to responders/coverage without stating a disability publicly | N13.4 |
| Permission verbs | view ≠ edit ≠ approve ≠ send ≠ export ≠ share; e.g. leasing may *propose* a rental decision but not *approve* (DR-06) | contract §3 |
| Capacity / acting-for | Every action records the capacity used and, for representatives, on whose behalf | platform-profile |

### 3.3 Separation of duties and capacity `[S]` N1.1 / `[D]` platform-profile

- SOD-1 `[S]` N1.1: one person may fill several roles, but spending authority,
  confidential-record access and financial-transaction checking keep clear boundaries.
- SOD-2 `[D]` N10.3: the person who requests a vendor payment-detail change, or
  receives the request, cannot be the person who independently verifies it.
- SOD-3 `[D]` N1.1, N11.2: the person who records a cash receipt or adjustment is not
  the person who reconciles it in period close `[P]` (exact pairs DR-06).
- SOD-4 `[S]` N8.3, N14.2: a complaint about a staff member or contractor is handled by
  someone other than the person complained about.
- SOD-5 `[D]` N3.1, N10.3: approvals above a delegated limit route to the next authority;
  nobody approves their own request above their limit.
- CAP-1 `[D]` platform-profile: a person holding several capacities selects one per
  action; permissions are never merged across capacities.
- CAP-2 `[D]` platform-profile, N16.4: temporary coverage (vacation, after-hours) has an
  end date; access ends automatically.
- CAP-3 `[S]` N13.1: departing staff/vendor access is revoked.
- CAP-4 `[D]` N1.1: at a small property where SOD-2/3/4 cannot be met by on-site staff,
  the check routes to another property's staff or ownership (open: DR-06).

## 4. Platform compatibility flags for Architecture / Experience `[D]`

| Flag | Actor(s) | Issue | Route |
|---|---|---|---|
| PF-1 | ACT-TEC, ACT-VEN | Field use on site; profile assumes browser UI with responsive behaviour, no mobile client | Experience/Architecture compatibility review (DR-11) |
| PF-2 | ACT-PRS, ACT-APL | Unauthenticated public inquiry/application, outside "authenticated" family | Architecture (DR-03) |
| PF-3 | ACT-CRA, ACT-PAY, ACT-ADV, ACT-AGY | External integrations; profile has "no arbitrary integrations" | Architecture (DR-05) |
| PF-4 | ACT-VEN, ACT-CNS, ACT-SUC | Invited external participants with item-scoped access — supported by profile | none, confirm |
| PF-5 | ACT-REP | "Acting for" delegation — supported | none, confirm |
| PF-6 | ACT-RES (no portal) | Alternative channels (paper, phone) imply staff-entered records on residents' behalf | Experience |

## 5. Validation questions (consolidated)

All validation questions above are unanswered; they are grouped into DR-03 (who uses
the application), DR-06 (approvals and separation of duties) and DR-12 (sensitive data
access) in the companion artifact REQ-EVAL-050-01-USECASES.

## 6. Self-check

| Check | Outcome |
|---|---|
| Every actor field present (purpose, goals, responsibilities, pressures, permissions, ownership, denied, boundary, lifecycle, situational, capacity, validation question) | Present for staff and principal external actors; condensed for data-subject-only and external-system actors where fields are not meaningful (explained) |
| No invented names, demographics, biographies | pass |
| Every statement tagged | pass; no `[K]` used as a rule |
| Disclosure-surface checklist applied | §3.2 |
| Capacity/coverage rules | §3.3 |
