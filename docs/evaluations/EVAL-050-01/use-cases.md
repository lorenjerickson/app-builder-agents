---
artifact_id: REQ-EVAL-050-01-USECASES
type: requirements_spec            # use-case part of a discovery-mode draft; companion part REQ-EVAL-050-01-ACTORS
part: use_cases, cross_cutting_rules, data_rules, quality_thresholds, configurable_targets, scope, decisions
revision: r1 (draft)
status: draft                      # discovery output; cannot satisfy G1
completeness: partial
missing_fields:
  - all quality-threshold values and measurement windows (DR-08)
  - configurable-target defaults (DR-07)
  - jurisdiction-dependent rule parameters (DR-02)
  - scope and priority acceptance (DR-01, mandatory)
  - no requirement is accepted; no product authority available in this run
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
  - ref: /home/claude/eval05/req/personas.md (REQ-EVAL-050-01-ACTORS r1, same task)
requirement_ids: []
traceability_reason: >-
  Pre-G1 discovery. Use cases (UC-*), acceptance scenarios (AS-*), cross-cutting
  rules (CCR-*), data concepts (DC-*), thresholds (QT-*), targets (CT-*) and
  decision requests (DR-*) carry provisional stable IDs intended to seed intake;
  no accepted requirement IDs exist. Traceability is to narrative sections N0–N17
  (code table in REQ-EVAL-050-01-ACTORS §0).
content_ref: /home/claude/eval05/req/use-cases.md (body below the BODY-START marker)
content_hash: sha256:ac47b3de949cb883062a026723dc01c8cf6107d0296c32ad0c3f44db2fdac91f
created: 2026-10-25
---
<!-- BODY-START -->

# Domain use cases — rental property office (discovery draft)

Source citation (`N<section>.<paragraph>`), source tags (`[S]`/`[D]`/`[A]`/`[P]`/`[K]`)
and actor IDs (`ACT-*`) follow REQ-EVAL-050-01-ACTORS §0–§1. No `[A]` tag appears:
no product authority is available in this run, and nothing here is accepted.

## 1. Problem framing

- **Affected actors** `[S]` N1.1: property manager, leasing, resident-service,
  maintenance and accounting staff, outside specialists, ownership, and the people
  whose homes are on the property (prospects, applicants, residents, occupants).
- **Current pain (as described, not measured)** `[S]` N1.2, N16.4: matters
  "disappear between teams or shifts"; availability, prices and promises drift between
  staff (N3.1, N3.3); distinct legal/financial events are easy to conflate (N7.1, N14.3);
  sensitive information must reach only those who need it (N6.4, N13.3); consistency is
  required for fair-housing compliance (N2.2). No baseline data exist `[D]`: every
  outcome baseline below is **unknown**.
- **Desired outcome** `[S]` N16.4: people understand their obligations, receive
  consistent service, live in maintained homes, resolve problems through documented,
  lawful processes; ownership has an accurate account of condition and finances.
- **Evidence vs hypothesis** `[D]`: the narrative is an illustrative operating model
  (N0.2). All "pains" are hypotheses about a typical office, to be validated against
  the chosen property (DR-02).

## 2. Cross-cutting rules

| ID | Rule | Tag | Basis | Governs |
|---|---|---|---|---|
| CCR-01 | No decision, offer, term, service, priority, advertising audience or communication may use race, color, religion, sex, national origin, familial status or disability, nor any additional characteristic protected under the selected jurisdiction or adopted operating policy; name, accent, appearance, family composition or perceived background are not suitability inputs. The application stores no field whose purpose is to capture these for decision-making. | [S] | N2.1–N2.3, N4.2–N4.3 | all UCs; esp. UC-04–UC-09, UC-15, UC-31 |
| CCR-02 | Operating policy additionally prohibits harassment or unequal treatment based on sexual orientation or gender identity. | [S] | N2.3 | all UCs |
| CCR-03 | Residents receive the same service standard regardless of staff liking, past complaints, or whether they owe money; routine work priority uses safety, impact, age and resources only. | [S] | N2.2, N9.1 | UC-12, UC-14, UC-15, UC-16 |
| CCR-04 | Requesting an accommodation, complaining about discrimination, or participating in an investigation must not trigger or influence an adverse action; the application must make such linkage reviewable (see UC-36). | [S] | N14.2 | UC-09, UC-14, UC-30, UC-31, UC-32 |
| CCR-05 | Distinct events are recorded as distinct facts and never inferred from one another: approved application ≠ signed lease ≠ cleared payment ≠ delivered possession; notice of intent to leave ≠ returned possession; reminder ≠ demand ≠ notice to cure ≠ termination notice ≠ court filing ≠ judgment ≠ enforcement of possession. | [S] | N3.3, N7.1, N14.3, N15.2 | UC-07, UC-10, UC-11, UC-21, UC-32, UC-33 |
| CCR-06 | Anticipated dates and confirmed dates are separate fields; a confirmed date requires a recorded basis. | [S] | N1.3, N3.3 | UC-02, UC-04, UC-11, UC-33 |
| CCR-07 | Jurisdiction-, program- and property-specific legal parameters (notice periods, deposit limits and deadlines, screening thresholds, notice wording, delivery methods, occupancy rules, entry notice) are not built in. They are configuration taken only from a locally reviewed policy version with a recorded reviewer and effective date; absent a reviewed value, the dependent step is blocked, not defaulted. | [S] | N0.2, N2.2, N14.3, N17 | UC-07, UC-08, UC-10, UC-16, UC-21, UC-30–UC-34, UC-37 |
| CCR-08 | Federal baseline, state/local, and assisted-program obligations are recorded as separate policy sources; one is not substituted for another. | [S] | N2.3, N6.3, N7.2, N16.2 | UC-08–UC-10, UC-37 |
| CCR-09 | Information is disclosed on a need-to-know basis per role and job: accommodation supporting information only to the accommodation reviewer; vendors receive only job information; outcomes tell other staff what arrangement to honour without medical details. Applies on every disclosure surface (ACTORS §3.2). | [S] | N6.2, N6.4, N10.2, N13.3 | all UCs |
| CCR-10 | Separation of duties: spending authority, confidential-record access and checking of financial transactions keep clear boundaries even when one person fills several roles (ACTORS §3.3). | [S] | N1.1, N10.3 | UC-03, UC-20–UC-24 |
| CCR-11 | Every open matter (repair, complaint, request, application, notice, promise) has a named owner and follow-up date; unowned matters are surfaced in the handoff. | [S] | N1.2, N7.3, N16.4 | all UCs; UC-01 |
| CCR-12 | An automated vendor recommendation or score is never the recorded reason for a decision; the decision records the relevant facts and the criteria applied. | [S] | N5.2, N5.4, N2.2 | UC-08 |
| CCR-13 | A balance flag never automatically stops maintenance, alters service priority, or produces a notice; notices come only from UC-32's reviewed process. | [S] | N11.4, N9.1 | UC-15, UC-16, UC-23, UC-32 |
| CCR-14 | Entry into an occupied home follows the reviewed notice/access rules; emergency entry follows its own procedure and is recorded; a maintenance request does not authorize unrestricted future entry. | [S] | N3.3, N9.2 | UC-16, UC-17, UC-19, UC-26 |
| CCR-15 | The application supports no action that bypasses lawful possession: no lockout, credential revocation, utility shutoff, or disposal of belongings is recorded as an enforcement step against an occupant without a recorded lawful authority (court order or verified return of possession). | [S] | N14.5, N13.1, N12.3, N15.2 | UC-27, UC-32, UC-33 |
| CCR-16 | Financial records are append-only in effect: corrections, reversals, returned and duplicate payments, refunds are new traceable entries linked to the original. | [S] | N11.1 | UC-21–UC-24 |
| CCR-17 | Security deposits and other protected funds are tracked as liabilities separate from operating income; distributions cannot consume protected funds or known obligations. | [S] | N11.2–N11.3 | UC-22, UC-24, UC-34 |
| CCR-18 | Legitimate exceptions go through an established, recorded process; consistency does not mean refusing every adjustment. | [S] | N2.2 | UC-03, UC-09, UC-25 |
| CCR-19 | Each complainant has an escalation path outside the employee or contractor involved. | [S] | N8.3, N10.2, N14.2, N16.1 | UC-14, UC-18 |
| CCR-20 | Each resident has a confirmed usable communication and payment channel; when the standard channel is unusable an alternative is recorded and used. | [S] | N7.4, N16.1 | UC-11, UC-21, UC-30, UC-32 |
| CCR-21 | Electronic messages or portal notifications are not assumed to satisfy legal notice; each notice type has a configured delivery method and proof-of-service record (CCR-07). | [S] | N14.1, N14.3 | UC-30–UC-33 |
| CCR-22 | Records needed for a claim or investigation are preserved (legal hold) including facts favourable to the resident; retention and disposal follow configured obligations. | [S] | N13.3, N14.3 | UC-29, UC-32 |
| CCR-23 | Waiting-list ordering rules are explicit and published; a position changes only by a recorded rule-based event (e.g. approved accommodation), never as a favour. | [S] | N4.5, N12.1 | UC-06, UC-25 |
| CCR-24 | A prospect receives the same price/terms regardless of which staff member answers: offers are effective-dated and conditions recorded. | [S] | N3.1 | UC-03, UC-04, UC-05 |
| CCR-25 | All data, queries, search, counts, reports, notifications and exports are filtered by the user's property scope; no cross-scope leakage. | [D] | N0.1 (mixed portfolios), platform-profile Tenancy | all UCs |
| CCR-26 | An external action with unknown outcome (payment, screening request, listing publication, notice delivery, vendor dispatch) is shown as pending/unknown, never success, and is reconciled before it is repeated. | [D] | contract §3 failure semantics; N11.2, N11.4 | UC-04, UC-08, UC-19, UC-21, UC-32 |
| CCR-27 | Duplicate submissions (applications, payments, repair reports, complaints) are detected and linked, not silently merged or double-counted. | [S] | N5.1, N11.1 | UC-07, UC-15, UC-21 |
| CCR-28 | Legal or program deadlines take precedence over internal service targets; each deadline records its provenance (legal/program vs internal target). | [D] | contract §3; N14.3, N15.3 | UC-09, UC-15, UC-32, UC-34; CT-* |
| CCR-29 | The application routes legal-interpretation questions to the designated manager or counsel; it does not present a legal determination of its own. | [D] | N2.3, N8.2, N14.4, N14.5 | UC-13, UC-31–UC-33 |
| CCR-30 | Collect only information relevant to the purpose; no irrelevant sensitive information at inquiry, tour or service time. | [S] | N4.4, N10.2 | UC-05, UC-07, UC-12 |
| CCR-31 | Emergency exceptions (spend, entry, access) are allowed but are recorded and later reviewed. | [S] | N9.2, N10.3 | UC-15, UC-16, UC-20, UC-28 |
| CCR-32 | Every consequential action records actor, capacity used, "acting for" principal if any, time and basis (audit). | [D] | N16.1, N14.3, platform-profile Telemetry/Delegation | all UCs |

### 2.1 Failure-semantics checklist (contract §3) applied

| Item | Rule(s) | Scenario examples |
|---|---|---|
| Duplicate submission and retry | CCR-27, CCR-16 | AS-07-03, AS-15-04, AS-21-03 |
| Unknown external outcome | CCR-26 | AS-08-05, AS-21-04, AS-19-03, AS-32-05 |
| Partial failure | CCR-26, CCR-11 | AS-10-04 (some signatures missing), AS-28-03 (multi-home emergency partially notified) |
| Stale facts at commit | CCR-24, CCR-06 | AS-03-03 (offer expired between quote and lease), AS-25-03 (space reassigned concurrently), AS-07-04 (unit reserved by simultaneous applicant) |
| Handoff with recipient, follow-up and returned outcome | CCR-11 | AS-01-02, AS-13-01, AS-19-02 |
| Dependency outage / degraded operation | QT-05, DR-08 | AS-01-04 (essential emergency intake during outage) |
| Deadline provenance | CCR-28 | AS-34-03, AS-09-04 |

## 3. Data concepts and rules

Entity concepts only; technical representation belongs to Architecture `[D]`.

| ID | Concept | Key fields / validation (tag) | Lifecycle / invariants (tag) | Privacy / retention (tag) |
|---|---|---|---|---|
| DC-01 | Owner / portfolio, Property, Building | owner, management agreement ref, jurisdiction ref, program refs `[S]` N0.2, N16.2 | property has exactly one jurisdiction policy set in force `[P]` | — |
| DC-02 | Home (unit) | building, features, accessibility features `[S]` N3.2 | readiness states: occupied → notice received → possession returned → make-ready → inspected → ready → reserved → occupied; also `held` (accommodation/repair) `[D]` N1.3, N3.3, N15.4; "ready" requires completed readiness checklist, not rent paid `[S]` N7.3 | — |
| DC-03 | Space: parking, storage, shared facility | type (assigned, unassigned, accessible, visitor, loading, charging; locker, garage, bike room; amenity) `[S]` N12.1–N12.4 | a space has at most one active exclusive assignment `[D]` N12.1; release only when obligations resolved `[S]` N15.4 | — |
| DC-04 | Equipment / asset | warranty, inspections, service contract, replacement plan `[S]` N9.4 | — | — |
| DC-05 | Person and party role | roles: leaseholder, authorized occupant, live-in aide, guarantor, emergency contact, representative (scope, validity), guest `[S]` N1.3, N8.1 | one person may hold several roles; each role has its own permissions `[D]` | contact & identity data restricted `[S]` N13.3 |
| DC-06 | Household | members by role, lease link | changes documented without treating family change as violation `[S]` N8.1 | — |
| DC-07 | Offer / pricing | rent, lease options, deposits, concessions, mandatory/optional charges, effective from/to, conditions, approver, limit basis `[S]` N3.1 | non-overlapping effective periods per home and term `[D]` | — |
| DC-08 | Listing | channel, content, photos (authorization flag), availability shown, last verified `[S]` N4.1 | must reflect current offer and availability `[S]` N4.1 | occupied-home photos require authorization `[S]` N4.1 |
| DC-09 | Inquiry, tour | channel, preferences, follow-up consent, access needs, remote option `[S]` N4.3–N4.4 | consent withdrawal stops follow-up `[D]` | no irrelevant sensitive info `[S]` N4.4 |
| DC-10 | Waiting list & entry | ordering rule (published), offer, withdrawal, position history `[S]` N4.5 | position changes only through rule events `[S]` | — |
| DC-11 | Application | applicants, fee, refund conditions, permissions obtained, completeness, received time `[S]` N5.1 | received → incomplete/complete → screening → disputed? → decided (approved / approved-with-conditions / denied) → withdrawn; duplicate-of link `[D]` | retention configured `[S]` N13.3 |
| DC-12 | Holding payment | terms, amount, disposition `[S]` N5.1 | separate from rent and deposit; disposition per terms `[S]` | — |
| DC-13 | Screening check & decision | source, result, dispute status, criteria version, decision reasons (facts), adverse-action flag `[S]` N5.2, N5.4 | decision cannot be "vendor score" alone `[S]` | consumer reports access-restricted `[D]` |
| DC-14 | Adverse-action notice | agency identity, statement agency did not decide, dispute and free-report rights, score disclosure if a score used, sent time/method `[S]` N5.4 | required when report contributes to denial or less favourable terms (incl. larger deposit, guarantor) `[S]` | retained `[P]` |
| DC-15 | Accommodation / modification request | requester (self/representative), received date, ordinary-language description, type (accommodation, modification, animal), info requested, alternatives discussed, outcome, honour-arrangement text `[S]` N6.1–N6.4 | received → acknowledged → info requested? → under review → approved / alternative agreed / denied → implemented → reviewed `[D]` | supporting info confined to ACT-ACR; no fee `[S]` |
| DC-16 | Lease & addenda | parties, term, rent, deposits, occupants, utilities, parking, storage, rules, disclosures given, signatures by party `[S]` N7.1–N7.2 | draft → disclosures verified → partially signed → fully executed → active → renewed/terminated; signing blocked until required disclosures recorded `[S]` N7.2 | — |
| DC-17 | Condition record | dated notes, photos, discrepancies reported by resident, per tenancy `[S]` N7.3, N15.3, N15.4 | new tenancy gets its own record `[S]` N15.4 | interior photos minimal `[S]` N9.2 |
| DC-18 | Key / access credential | holder, home/space, issued, revoked, verification of authority `[S]` N13.1 | revoke on lawful change of possession and departure of staff/vendor `[S]` | — |
| DC-19 | Repair request / work order | location, symptoms, reported time, hazard, access arrangement, urgency circumstances, priority, assignee, entry notice, temporary repair, parts, specialist, follow-up inspection, labour, materials, recurring cause `[S]` N9.1–N9.3 | reported → triaged → scheduled → entry noticed → in progress → temporary/awaiting part/specialist → completed → verified → closed; cannot close with outstanding follow-up `[S]` N9.3 | — |
| DC-20 | Vendor, contract, insurance certificate | qualifications, licence, insurance expiry, pricing, scope, response expectations, confidentiality, payment details (verified) `[S]` N10.1–N10.3 | payment-detail change pending until independent verification `[S]` | — |
| DC-21 | Purchase / invoice | linked work, approval, limit, emergency flag, completion match `[S]` N10.3 | invoice payable only when matched to approved work and completion `[S]` | — |
| DC-22 | Household ledger entries | type (rent, utilities, parking, storage, pet, fee, deposit, credit, concession, adjustment, payment, reversal, refund), source, link `[S]` N11.1 | balance derived from entries; application order per configured rule `[S]` | — |
| DC-23 | Payment plan | terms, authorizer, schedule, compliance `[S]` N11.4 | — | — |
| DC-24 | Deposit liability / protected fund | amount, interest rule, account, deductions with support, refund, statement, deadline provenance `[S]` N11.2, N15.3 | liability ≥ 0; deductions need documented support `[S]` | — |
| DC-25 | Reconciliation / period close | bank, processor settlement, ledger comparison `[S]` N11.2–N11.3 | close requires matched totals or recorded exceptions `[D]` | — |
| DC-26 | Owner report / distribution | vacancy loss, concessions, arrears, maintenance spend, variances, commitments `[S]` N11.3 | distribution ≤ available after protected funds and obligations `[S]` | aggregate `[D]` |
| DC-27 | Complaint | subject, about staff/vendor flag, investigation notes, outcome explanation `[S]` N8.3 | logged → investigating → resolved (explained) → closed `[D]` | handled outside involved person `[S]` |
| DC-28 | Violation / enforcement matter | evidence, lease/law refs, explanation invited, protections reviewed (accommodation, retaliation, survivor, military, bankruptcy, subsidy) `[S]` N14.2, N14.4 | — | preserved `[S]` N14.3 |
| DC-29 | Notice | type (reminder, demand, cure, termination, renewal offer, nonrenewal, entry, program-specific…), wording version, recipients, delivery method, deadline, proof of service `[S]` N14.1, N14.3 | draft → reviewed → served (proof) → deadline passed/cured `[D]` | — |
| DC-30 | Legal case | hearings, orders, settlements, payments, authority to proceed `[S]` N14.5 | — | legal hold `[S]` |
| DC-31 | Move-out & possession event | notice, anticipated date, forwarding info, keys returned, possession basis (surrender, judgment enforcement, determined abandonment after review), left-property record `[S]` N15.1–N15.2 | possession confirmed only with recorded basis `[S]` | — |
| DC-32 | Task / follow-up / handoff entry | owner, due, promise made, contacted parties, outcome `[S]` N1.2, N16.4 | — | — |
| DC-33 | Communication log | channel, parties, content summary, consent `[S]` N14.1, N4.4 | — | — |
| DC-34 | Incident (security/emergency) | type, affected homes, responders contacted, instructions, relocation, insurance claim, temporary measures, follow-up `[S]` N13.2, N13.4 | — | evacuation needs without disability disclosure `[S]` |
| DC-35 | Compliance item | licence, registration, inspection schedule, insurance renewal `[S]` N16.4 | — | — |
| DC-36 | Program record | certification, recertification, subsidy payment, agency inspection, rent approval `[S]` N16.2 | agency share and resident share separate `[S]` | — |
| DC-37 | Policy version | type (screening criteria, occupancy, advertising, animals, notices…), reviewer, review date, effective date, jurisdiction `[S]` N2.2, N2.3, N5.3 | only one version in force per type and property `[P]` | — |
| DC-38 | Camera / access log (if used) | purpose, locations, retention, authorized viewers `[S]` N13.2 | — | no private interiors `[S]` |

**Integration expectations** `[D]`: payment processor/bank (N11.2), consumer reporting
agencies (N5.2), listing services (N4.1), assistance agencies (N16.2), possibly
e-signature and messaging (N7.1, N14.1). None is assumed in scope (DR-05).

**Retention, export and audit** `[S]` N13.3, N16.3: retention and disposal follow
configured obligations (values open, DR-09); legal hold overrides disposal (CCR-22);
management-transfer export (UC-39); audit per CCR-32.

## 4. Domain use cases

Format per UC: actor/outcome; trigger and normal flow; rules; exceptions; priority
(recommendation `[P]`, see §7); scenarios (AS-UC-n). Priority basis codes:
**P1** recommended pilot (DR-01 option A), **P2** next increment, **P3** later,
**L** blocked on jurisdiction/legal review (DR-02/DR-10) regardless of slice.

### UC-01 Daily handoff and matter ownership — P1
- Actor/outcome `[S]` N1.2, N16.4: ACT-PM, all staff, ACT-AHS; nothing disappears between shifts.
- Flow `[S]`: at start of day, review emergencies, unanswered messages, appointments,
  vacant homes, expected move-ins/outs, overdue repairs, vendor visits, payments needing
  attention; assign owner and follow-up date; at end of day record what happened, who was
  contacted, what was promised, what remains, who acts next.
- Rules: CCR-11, CCR-25, CCR-09.

| ID | Given | When | Then |
|---|---|---|---|
| AS-01-01 | open matters across repairs, applications and messages for property P | manager opens the day's handoff | every open matter in P's scope is listed with owner and due date; matters lacking an owner or past due are flagged first |
| AS-01-02 | a technician promised a resident a return visit | the technician ends the shift | the handoff entry records the promise, contacted party, and next owner; the recipient sees it and records the returned outcome |
| AS-01-03 (denied/disclosure) | a matter is an accommodation request | a leasing user views the handoff | the item shows "accommodation matter – owner ACT-ACR" without content |
| AS-01-04 (degraded) | the application is unavailable | an emergency is reported | the essential-function fallback defined under QT-05 is used and the event is entered when service returns (fallback list open, DR-08) |
| AS-01-05 (scope) | user assigned only to property P | user views handoff | no matter from property Q appears in lists, counts or search |

### UC-02 Inventory and readiness of homes and spaces — P1
- Actor/outcome `[S]` N1.3, N3.2, N3.3: ACT-PM, ACT-MNL, ACT-LEA; a true picture of what is
  available and when.
- Flow: maintain property → building → home, plus spaces; track readiness checklist
  (possession, cleaning, repairs, inspection, utilities, accommodation features,
  promised parking/storage/amenities); anticipated vs confirmed availability.
- Rules: CCR-06, CCR-05, CCR-15.
- Exceptions `[S]` N3.3: departure or repairs slip → revise availability, notify affected prospects.

| ID | Given | When | Then |
|---|---|---|---|
| AS-02-01 | a home with a notice to vacate | staff view its status | shows anticipated availability; no confirmed date; "possession not returned" |
| AS-02-02 (negative) | readiness checklist has open unsafe item | user tries to mark home ready | refused with the outstanding item named |
| AS-02-03 (boundary) | all checklist items complete, possession confirmed | lead marks ready | status ready; confirmed date recorded with basis |
| AS-02-04 | anticipated date moves later | lead updates the date | prospects/applicants linked to the home are listed for contact and a follow-up task is created per prospect (UC-01) |
| AS-02-05 | a promised parking space is not actually available | readiness check runs | the space item is open and the home is not ready-with-promised-features |

### UC-03 Pricing and offers — P2
- Actor/outcome `[S]` N3.1: ACT-PM within ACT-OWN limits; everyone quotes the same terms.
- Rules: CCR-24, CCR-10, CCR-07 (rent restrictions, subsidy agreements), CCR-18.

| ID | Given | When | Then |
|---|---|---|---|
| AS-03-01 | offer O effective today for home H | any leasing user quotes H | sees O's rent, deposits, concessions, mandatory/optional charges and conditions |
| AS-03-02 (denied) | manager's delegated limit is L | manager sets a concession beyond L | saved as proposal pending ownership approval; not quotable |
| AS-03-03 (stale) | quote given under O; O expired before lease drafting | lease is drafted | user is warned of the change and must apply the current offer or a recorded approved exception |
| AS-03-04 (boundary) | two offers for same home/term | second offer overlaps the first's period | rejected as overlapping |

### UC-04 Listings and advertising review — P2
- Actor/outcome `[S]` N4.1–N4.2: ACT-LEA, ACT-PM; accurate, non-discriminatory advertising.
- Rules: CCR-01, CCR-24, CCR-26, CCR-09 (photos).

| ID | Given | When | Then |
|---|---|---|---|
| AS-04-01 | home no longer available | status changes | every listing for it is flagged stale until corrected or withdrawn |
| AS-04-02 | an advertisement draft | manager reviews | review records words, pictures, and provider audiences/exclusions checked against the advertising policy version |
| AS-04-03 (negative) | photo of an occupied home without authorization flag | user attaches to listing | blocked |
| AS-04-04 (unknown outcome) | publication to an external channel times out | user views listing | channel status "unknown — reconcile", not "published" |

### UC-05 Inquiry and tour — P2
- Actor/outcome `[S]` N4.3–N4.4: ACT-PRS, ACT-LEA; comparable information and tours.
- Rules: CCR-01, CCR-30, CCR-24, CCR-20.

| ID | Given | When | Then |
|---|---|---|---|
| AS-05-01 | inquiry by phone, email, form, referral or walk-in | staff record it | channel, expressed preferences, follow-up consent recorded; no protected-characteristic fields exist |
| AS-05-02 | prospect requests remote tour or mobility arrangement | tour scheduled | arrangement recorded and visible to the touring staff |
| AS-05-03 | prospect withdraws follow-up consent | staff attempt follow-up | follow-up suppressed |
| AS-05-04 (consistency) | two prospects inquire about the same home type | staff respond | both receive the same available-home set and costs (reviewable in UC-36) |

### UC-06 Waiting list — P3
- `[S]` N4.5, N12.1. Rules: CCR-23, CCR-18.

| ID | Given | When | Then |
|---|---|---|---|
| AS-06-01 | published ordering rule | entry added | position computed by rule and explained to entrant |
| AS-06-02 (denied) | staff attempts manual reorder without a rule event | saves | refused; attempt audited |
| AS-06-03 | approved accommodation requires different assignment | applied | position/assignment change recorded with the accommodation reference (no details) |
| AS-06-04 | entrant declines an offer | recorded | outcome follows the published withdrawal/offer rule |

### UC-07 Application intake — P2, L (fees, permissions)
- `[S]` N5.1. Actor: ACT-APL, ACT-LEA. Rules: CCR-27, CCR-05, CCR-30, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-07-01 | application received | recorded | receipt time, fee and refund conditions explained, permissions obtained, completeness status |
| AS-07-02 (incomplete) | missing item | completeness check | applicant told what is missing via usable channel; follow-up task created |
| AS-07-03 (duplicate) | same household submits twice | second submission | linked as duplicate; fee not double-charged |
| AS-07-04 (simultaneous / stale) | two applications for same home | both complete | handled per the stated simultaneous-applicant process (order rule recorded); reservation is held by at most one |
| AS-07-05 | holding payment taken | recorded | held separately from rent/deposit with documented terms; approval does not convert it automatically |
| AS-07-06 | applicant withdraws | recorded | disposition of fee/holding payment per terms; reservation released |

### UC-08 Screening and rental decision — P3, L
- `[S]` N5.2–N5.4. Actor: ACT-LEA, ACT-PM, ACT-CRA. Rules: CCR-12, CCR-01, CCR-08, CCR-26, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-08-01 | verification complete | decision recorded | decision cites criteria version and relevant facts; vendor recommendation alone is rejected as a reason |
| AS-08-02 | subsidy household | ability to pay assessed | uses applicant's own payment obligation |
| AS-08-03 | applicant disputes a record (wrong person, outdated, filing without judgment) | dispute logged | routed for review; applicant told how to supply corrections; decision pending |
| AS-08-04 (adverse action) | consumer report contributed to denial, larger deposit or guarantor requirement | decision finalized | adverse-action notice recorded with agency identity, agency-did-not-decide statement, dispute and free-report-within-60-days rights, and score disclosure if a score was used; send time/method recorded |
| AS-08-05 (unknown outcome) | screening request to vendor has no response | staff view | status pending/unknown; not "clear"; resubmission requires reconciliation |
| AS-08-06 (denied) | user without consumer-report permission | opens report | denied; access attempt audited |

### UC-09 Accommodation, modification and assistance-animal requests — P1 (arrangement record), L (policy)
- `[S]` N6.1–N6.4. Actor: any requester, ACT-REP, ACT-ACR. Rules: CCR-09, CCR-04, CCR-18, CCR-28.

| ID | Given | When | Then |
|---|---|---|---|
| AS-09-01 | resident says in ordinary words they cannot use stairs to reach the assigned parking | staff record it | recorded as an accommodation request and referred to ACT-ACR; no form or legal wording required |
| AS-09-02 | request by representative | recorded | representative and scope noted |
| AS-09-03 (negative) | any fee configured | request is created | no charge can be attached to the request |
| AS-09-04 (deadline) | request received | target and any legal deadline applicable | acknowledgement due shown with provenance; legal deadline governs where stricter (CT-03) |
| AS-09-05 | approved animal arrangement | technician opens work order for that home | sees "arrangement: [agreed handling]" only; accounting sees the charge treatment; neither sees supporting info |
| AS-09-06 | requested arrangement not reasonable | reviewer records | effective alternatives discussed are recorded before denial |
| AS-09-07 | request made during enforcement | recorded | linked enforcement matter shows "pending accommodation review" blocking escalation (UC-32) |
| AS-09-08 | approved modification | implemented | physical work runs as a work order with qualified personnel; payer/restoration recorded per policy (L) |

### UC-10 Lease execution and disclosures — P3, L
- `[S]` N7.1–N7.2. Rules: CCR-05, CCR-07, CCR-08.

| ID | Given | When | Then |
|---|---|---|---|
| AS-10-01 | property flagged as requiring lead disclosure (e.g. pre-1978) | lease sent for signature | blocked until disclosure delivery is recorded |
| AS-10-02 | lease with guarantor and representative | prepared | guarantor obligations and representative permissions explicit |
| AS-10-03 | approved application | lease not signed | home status remains reserved, not leased |
| AS-10-04 (partial) | two of three required signatures received | status | "partially signed"; lease not effective; follow-up task |

### UC-11 Move-in and handover — P1 (condition record, keys), P2 (rest)
- `[S]` N7.3–N7.4. Rules: CCR-05, CCR-20, CCR-06.

| ID | Given | When | Then |
|---|---|---|---|
| AS-11-01 | move-in appointment | inspection done | dated condition notes and appropriate photos stored on a new condition record |
| AS-11-02 | resident reports discrepancy within allowed window | recorded | added to move-in condition, distinct from later damage |
| AS-11-03 (negative) | home has an unsafe item; rent paid | staff attempt handover | blocked; rent payment does not make home ready |
| AS-11-04 | noncritical work outstanding | handover proceeds | each item has owner and agreed follow-up |
| AS-11-05 | resident cannot use portal | channels confirmed | alternative channel recorded and used for notices and receipts |
| AS-11-06 | keys/credentials, permits, storage issued | recorded | each issued item linked to holder and home/space |

### UC-12 Resident service requests and household changes — P2
- `[S]` N8.1. Rules: CCR-03, CCR-30, CCR-32.

| ID | Given | When | Then |
|---|---|---|---|
| AS-12-01 | new child or caregiver | recorded | household change documented; no violation is created automatically |
| AS-12-02 (denied) | non-leaseholder requests a lease change | submitted | recorded as request; cannot be executed without authorized party |
| AS-12-03 | new vehicle | recorded | parking record updated (UC-25) |

### UC-13 Transfers, early termination and special circumstances — P3, L
- `[S]` N8.2. Rules: CCR-29, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-13-01 | request involves military service, death, incapacity or domestic violence | recorded | routed to designated manager with owner/follow-up; no standard fee quoted |
| AS-13-02 | transfer approved | executed | new condition inspection, rent, access, deposit disposition recorded |

### UC-14 Complaints — P2
- `[S]` N8.3, N10.2. Rules: CCR-19, CCR-04, CCR-01.

| ID | Given | When | Then |
|---|---|---|---|
| AS-14-01 | complaint about staff member S | assigned | cannot be assigned to S; S cannot view it |
| AS-14-02 | neighbour accusation | investigated | recorded as allegation; facts recorded; closed with explanation to complainant |
| AS-14-03 | complaint suggests discriminatory harassment | logged | flagged for prompt manager attention |
| AS-14-04 (retaliation) | resident has complained | later adverse action proposed | reviewer is shown the prior complaint link (UC-31/36) |

### UC-15 Repair request intake and triage — P1
- `[S]` N9.1. Rules: CCR-03, CCR-13, CCR-27, CCR-28, CCR-31.

| ID | Given | When | Then |
|---|---|---|---|
| AS-15-01 | report from resident, staff, vendor or alarm | recorded | location, symptoms, time, hazard, access arrangements, urgency circumstances recorded |
| AS-15-02 | active flooding, suspected gas leak, fire, loss of essential services, failed secure entrance | triaged | emergency category; immediate-action owner; responders contacted per UC-28 where relevant |
| AS-15-03 (fairness) | two routine requests with equal safety, impact and age | prioritized | equal priority irrespective of balance or complaint history |
| AS-15-04 (duplicate) | second report of same leak from neighbour | recorded | linked to existing work order; both reporters updated |
| AS-15-05 | resident has an outstanding balance | request made | accepted and prioritized normally |

### UC-16 Work order execution, entry and completion — P1
- `[S]` N9.2–N9.3. Rules: CCR-14, CCR-09, CCR-31.

| ID | Given | When | Then |
|---|---|---|---|
| AS-16-01 | non-emergency entry needed | scheduled | entry notice recorded per configured rule (L) before entry time |
| AS-16-02 | emergency | entry made | emergency entry recorded with reason and later review |
| AS-16-03 (denied) | earlier request authorized one entry | later unrelated visit | requires its own notice; prior authorization not reused |
| AS-16-04 | temporary repair or part ordered | technician tries to close | stays open with outstanding item |
| AS-16-05 | completion | closed | repair verified, labour/materials recorded, recurring cause noted, resident informed |
| AS-16-06 | home unusable | assessed | temporary accommodation/relocation decision recorded |
| AS-16-07 | damage charge contested | recorded | handled separately; repair not delayed |

### UC-17 Preventive maintenance, inspections and capital work — P2
- `[S]` N9.4. Hazards (mold, lead, asbestos) require qualified assessment `[S]`.

| ID | Given | When | Then |
|---|---|---|---|
| AS-17-01 | equipment with inspection schedule | due date approaches | work order generated with owner |
| AS-17-02 | warranty active | repair on that equipment | warranty flagged for claim |
| AS-17-03 | capital project | started | owner approval, budget, permits, resident notices, access, completion confirmation recorded |
| AS-17-04 (negative) | hazard type requiring qualified assessment | assigned to unqualified staff | warning; qualified vendor/staff required |

### UC-18 Vendor qualification and contracts — P2
- `[S]` N10.1, N10.3. Rules: CCR-19.

| ID | Given | When | Then |
|---|---|---|---|
| AS-18-01 | vendor onboarded | recorded | qualifications, licence where required, insurance, pricing, references, conflicts checked |
| AS-18-02 | insurance expires | dispatch attempted | warning/block per policy (DR-06) |
| AS-18-03 | complaint about vendor conduct | logged | investigation independent of vendor's sponsor |
| AS-18-04 | sole vendor for essential system unavailable | lookup | alternative providers listed |

### UC-19 Vendor dispatch and access — P1
- `[S]` N10.2, N13.1. Rules: CCR-09, CCR-14, CCR-26.

| ID | Given | When | Then |
|---|---|---|---|
| AS-19-01 | vendor assigned | dispatch | vendor receives only job info, access arrangement, honour-arrangement text; no financial/accommodation files |
| AS-19-02 | dispatch | resident informed | resident told who/when/what; outcome returned to the work order |
| AS-19-03 (unknown) | vendor confirmation not received | view | "unconfirmed", not scheduled |
| AS-19-04 | job ends | closed | temporary credentials revoked/recovered |

### UC-20 Purchasing and invoices — P2
- `[S]` N10.3. Rules: CCR-10, CCR-31.

| ID | Given | When | Then |
|---|---|---|---|
| AS-20-01 | invoice | matched | paid only if matched to approved work and completion |
| AS-20-02 | extra work beyond limit | requested | requires approval at next level |
| AS-20-03 | emergency extra work | done | recorded with emergency flag and later reviewed |
| AS-20-04 (SOD) | request to change vendor bank details | same user tries to verify | refused; independent verification by another person through independent contact |

### UC-21 Household ledger and statements — P3, L
- `[S]` N11.1. Rules: CCR-16, CCR-27, CCR-26, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-21-01 | resident requests statement | produced | understandable; distinguishes rent, utilities, parking, storage, pet, fees |
| AS-21-02 | resident challenges entry | logged | dispute tracked to resolution; correction as new linked entry |
| AS-21-03 (duplicate) | same payment received twice | detected | flagged; refund or credit traceable |
| AS-21-04 (unknown) | processor result unknown | view | pending, not paid; reconciliation required before re-attempt |
| AS-21-05 | returned payment | posted | reversal linked to original |

### UC-22 Reconciliation, protected funds and period close — P3, L
- `[S]` N11.2–N11.3. Rules: CCR-17, CCR-10.

| ID | Given | When | Then |
|---|---|---|---|
| AS-22-01 | settlement differs from receipts | reconciliation | difference listed as exception |
| AS-22-02 | cash payment | accepted | receipt issued; controlled-handling record |
| AS-22-03 | deposits | close | deposit liability total equals protected-fund records or exception shown |

### UC-23 Missed payment handling — P3, L
- `[S]` N11.4, N16.2. Rules: CCR-13, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-23-01 | rent unpaid at due | detected | verification task first: pending, misapplied, disputed, agency-expected |
| AS-23-02 | agency payment delayed | recorded | agency share and resident share shown separately |
| AS-23-03 | payment plan authorized | recorded | terms and compliance tracked |
| AS-23-04 (negative) | balance flag | any maintenance request | unaffected |

### UC-24 Owner reporting and distributions — P3
- `[S]` N11.3. Rules: CCR-17.

| ID | Given | When | Then |
|---|---|---|---|
| AS-24-01 | period closed | owner report | vacancy loss, concessions, arrears, maintenance spending, variances, commitments |
| AS-24-02 (negative) | proposed distribution exceeds available after protected funds and known obligations | submitted | refused |

### UC-25 Parking and storage — P3
- `[S]` N12.1–N12.3. Rules: CCR-23, CCR-18, CCR-15.

| ID | Given | When | Then |
|---|---|---|---|
| AS-25-01 | space assigned | second assignment attempted | refused (double assignment) |
| AS-25-02 | accommodation requires accessible space | applied | assignment differs from queue with reference |
| AS-25-03 (stale) | two staff assign same space concurrently | second commit | rejected with current holder shown |
| AS-25-04 | towing requested | before removal | facts and authorization verified by staff; contractor not deciding |
| AS-25-05 (negative) | belongings left in storage | disposal attempted | blocked until applicable procedure recorded |

### UC-26 Amenities, packages and shared facilities — P3
- `[S]` N12.4. Reservations, outages, closures with notice, lost items; family-related restrictions require review.

| ID | Given | When | Then |
|---|---|---|---|
| AS-26-01 | amenity closure | scheduled | affected residents notified via their channel |
| AS-26-02 | proposed rule restricts children | entered | requires policy review before publication |

### UC-27 Keys and access credentials — P1
- `[S]` N13.1. Rules: CCR-15, CCR-09.

| ID | Given | When | Then |
|---|---|---|---|
| AS-27-01 | lockout request | before issuing | requester's authority verified and recorded |
| AS-27-02 (negative) | disputed household relationship | one occupant requests re-key excluding another | routed to manager; not executed by front desk |
| AS-27-03 | staff/vendor departs | offboarding | their credentials revoked |
| AS-27-04 | possession lawfully returned | turnover | credentials disabled/recovered |

### UC-28 Security incidents and emergencies — P2
- `[S]` N13.2, N13.4. Rules: CCR-09, CCR-31, CCR-01.

| ID | Given | When | Then |
|---|---|---|---|
| AS-28-01 | report of threat/stalking/violence | logged | prompt triage owner; evidence preserved |
| AS-28-02 | evacuation | instructions | accessible instructions; access needs list available to authorized staff/responders without diagnoses |
| AS-28-03 (partial) | multi-home emergency | notifications | per-home delivery status tracked; un-reached homes listed |
| AS-28-04 | after incident | close | temporary measures removal and recurring-risk review recorded |

### UC-29 Records privacy, retention and legal hold — P1 (access control), L (retention values)
- `[S]` N13.3. Rules: CCR-09, CCR-22, CCR-25.

| ID | Given | When | Then |
|---|---|---|---|
| AS-29-01 | disclosure request by phone | staff | recipient verification recorded before disclosure |
| AS-29-02 | retention period lapses | record under legal hold | not disposed |
| AS-29-03 | lost device / compromised account | reported | sessions revoked; incident record (L for notification duties) |

### UC-30 Renewals and nonrenewal — P3, L
- `[S]` N14.1. Rules: CCR-21, CCR-04, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-30-01 | lease approaching end | renewal review | eligibility, terms, rent restrictions, notice requirements shown |
| AS-30-02 (negative) | resident silent | deadline passes | not recorded as acceptance unless configured legal effect |
| AS-30-03 | nonrenewal | proposed | requires stated grounds where configured; retaliation check (CCR-04) |

### UC-31 Violations — P3, L
- `[S]` N14.2. Rules: CCR-04, CCR-01, CCR-29.

| ID | Given | When | Then |
|---|---|---|---|
| AS-31-01 | possible violation | opened | evidence, lease/law refs, invited explanation, protections reviewed |
| AS-31-02 | discriminatory harassment allegation | opened | prompt action owner; not deferred to renewal |

### UC-32 Notices and legal proceedings — L (out of pilot)
- `[S]` N14.3–N14.5. Rules: CCR-05, CCR-07, CCR-13, CCR-15, CCR-21, CCR-22, CCR-29.

| ID | Given | When | Then |
|---|---|---|---|
| AS-32-01 | no reviewed wording/delivery configuration | staff create notice | blocked |
| AS-32-02 | pre-filing | proceed requested | manager and counsel review of subsidy, bankruptcy, military, retaliation, survivor protections, pending accommodations/disputes recorded |
| AS-32-03 (negative) | termination notice served | staff tries to revoke credentials / record lockout | refused (CCR-15) |
| AS-32-04 | matter | evidence package | includes ledger, lease, correspondence, favourable facts |
| AS-32-05 (unknown) | notice sent by carrier; proof missing | view | service status unknown; deadline not started |

### UC-33 Move-out and possession — P1 (possession basis, keys), L (abandonment)
- `[S]` N15.1–N15.2. Rules: CCR-05, CCR-06, CCR-15.

| ID | Given | When | Then |
|---|---|---|---|
| AS-33-01 | notice to vacate | recorded | anticipated date, obligations, inspection, forwarding info, items to return |
| AS-33-02 (negative) | home looks empty, rent unpaid | staff marks possession returned | refused without recorded basis; abandonment review routed |
| AS-33-03 | remaining occupant / death / property left | recorded | separate review matter |

### UC-34 Final inspection and deposit disposition — P3, L
- `[S]` N15.3. Rules: CCR-17, CCR-28, CCR-07.

| ID | Given | When | Then |
|---|---|---|---|
| AS-34-01 | final inspection | compared | against move-in and intervening maintenance records |
| AS-34-02 | deduction | proposed | requires documented support; ordinary wear/pre-existing excluded |
| AS-34-03 (deadline) | configured legal deadline | pending repairs | statement due date displayed with legal provenance; repairs do not extend it |

### UC-35 Turnover — P1
- `[S]` N15.4. Rules: CCR-15, CCR-06.

| ID | Given | When | Then |
|---|---|---|---|
| AS-35-01 | possession returned | turnover | secure, access updated, utilities transferred, make-ready (UC-02) |
| AS-35-02 (negative) | parking with outstanding obligation | release | blocked until resolved |
| AS-35-03 | new household | move-in | new condition record; no inherited assumptions |

### UC-36 Oversight and consistency review — P2
- `[S]` N2.3, N16.1. Rules: CCR-01, CCR-04, CCR-03.

| ID | Given | When | Then |
|---|---|---|---|
| AS-36-01 | period | review | outcomes of applications, complaints, service delays, accommodations, collections, deposit disputes, vendor performance available for review |
| AS-36-02 | escalation | outcome | named decision-maker and documented outcome |

### UC-37 Assisted/regulated housing program work — L (out of pilot unless DR-02 selects a program)
- `[S]` N16.2. Certifications, recertifications, subsidy payments, agency inspections, rent approvals; survivor confidentiality and emergency transfers.

| ID | Given | When | Then |
|---|---|---|---|
| AS-37-01 | covered program | survivor records | confidentiality restricted beyond normal access |

### UC-38 Compliance calendar — P2
- `[S]` N16.4. Licences, registrations, inspection schedules, insurance renewals, staff coverage.

| ID | Given | When | Then |
|---|---|---|---|
| AS-38-01 | due item | approaching | owner and reminder; overdue shown in handoff |

### UC-39 Management or ownership transfer — P3
- `[S]` N16.3. Rules: CCR-09, CCR-17, CCR-32.

| ID | Given | When | Then |
|---|---|---|---|
| AS-39-01 | authorized transfer | export | leases, balances, protected funds, keys, contracts, open repairs, arrangements, pending notices; access-logged; payment history and open safety issues retained |

## 5. Quality thresholds (all unresolved)

No value is stated in the source; none is invented. Each needs metric, unit, target,
workload, window and owner from authority (DR-08). Windows are not assumed.

| ID | Metric (proposed) | Unit | Target | Workload | Window | Owner | Tag |
|---|---|---|---|---|---|---|---|
| QT-01 | Availability of staff application | % of time | unresolved | unresolved | unresolved — e.g. 99.5% allows ≈3.6 h/30 days or ≈43.8 h/year; authority to choose | product authority | [P] |
| QT-02 | Recovery time objective | h | unresolved; must fit inside QT-01 allowance | — | per incident | product/platform authority | [P] |
| QT-03 | Recovery point objective (financial & legal records) | min | unresolved | — | — | product authority | [P] |
| QT-04 | Interactive response time | s, p95 | unresolved | users, records (unknown property size, DR-02) | unresolved | product authority | [P] |
| QT-05 | Degraded operation essential functions | list | candidate list: emergency repair intake, emergency contacts and access notes, handoff view, key/credential verification `[P]` | — | maintenance limits consistent with QT-01 | product authority | [P] |
| QT-06 | Accessibility conformance | standard level | unresolved (platform says accessible components) | — | — | product authority | [P] |
| QT-07 | Outcome: open matters without owner at handoff | count | unknown baseline | — | daily | ACT-PM | [P] |
| QT-08 | Outcome: repair completion vs target (CT-01) | % | unresolved | — | unresolved | ACT-PM | [P] |

Threshold consistency (contract §3): QT-01/02/05 must be checked together once values exist.

## 6. Configurable targets

| ID | Target | Dimensions | Shipped default | Override / precedence | Tag |
|---|---|---|---|---|---|
| CT-01 | Repair response & completion target | property × priority category (emergency, urgent, routine) × calendar (business/after-hours) | none proposed — narrative gives none (DR-07) | property overrides portfolio; legal/program deadline overrides target (CCR-28) | [P] |
| CT-02 | Inquiry follow-up target | property × channel | none (DR-07) | — | [P] |
| CT-03 | Accommodation acknowledgement / decision target | property | none (DR-07) | legal/program deadline overrides | [P] |
| CT-04 | Complaint follow-up target | property × category | none (DR-07) | — | [P] |
| CT-05 | Listing staleness check interval | property × channel | none (DR-07) | — | [P] |

## 7. Scope and priority recommendation `[P]`

- **Option A (recommended): operations core** — UC-01, UC-02, UC-09 (arrangement record
  only), UC-11 (condition record, keys), UC-15, UC-16, UC-19, UC-27, UC-29 (access
  control), UC-33 (possession basis), UC-35. Basis: narrative's central pain (matters lost
  between shifts; readiness truth); fewer jurisdiction-dependent rules (CCR-07) so it can
  proceed before DR-02; exercises the hardest cross-cutting rules (need-to-know, entry,
  no self-help) early.
- **Option B: leasing funnel** — UC-03 to UC-08, UC-10. Highest fair-housing/FCRA risk;
  blocked on DR-02/DR-10.
- **Option C: money** — UC-21 to UC-24, UC-34. Blocked on DR-02 and DR-04.
- **Option D: full office** — all UCs.
- **Exclusions recommended for any first slice** `[P]`: UC-32 notices/eviction, UC-37
  programs, cameras/access logs (DC-38), owner portal, public self-service.

## 8. Decision requests

Each is a `decision_request` (contract §3). Proposed owner: product authority unless noted.
Affected artifacts: this artifact and REQ-EVAL-050-01-ACTORS.

**DR-01 (mandatory) Scope.** Question: which slice is the first product scope?
Explanation: the narrative describes an entire office; building all of it at once
delays any usable result. Example: Option A would let a technician see a leak report,
the agreed entry arrangement and the animal handling note, but not take rent. Options:
A/B/C/D (§7) — impact: A earliest, lowest legal dependency; B/C blocked on DR-02.
Recommendation: A. Consequence of deferral: no intake possible; G1 cannot be approached.
Affected: all UCs' priority.

**DR-02 Jurisdiction and property profile.** Question: which state/municipality, property
type and size, programs, amenities? Explanation: notice periods, deposit rules, screening
limits differ by place; e.g. a deposit-return deadline cannot be shown without it.
Options: (a) select one pilot property now; (b) proceed with Option A and keep L items
blocked. Recommendation: (b) then (a) before any L UC. Deferral: all L-tagged UCs blocked.
Affected: CCR-07, UC-07–UC-10, UC-13, UC-21–UC-23, UC-30–UC-34, UC-37, QT-04.

**DR-03 Who uses the application.** Options: (a) staff only; (b) + residents portal;
(c) + prospects/applicants public; (d) + vendors/counsel invited. Example: if residents
cannot log in, staff enter repair calls themselves. Impact: (c) is outside the
authenticated profile (PF-2). Recommendation: (a) with (d) item-scoped vendor job access
later. Deferral: actor permissions remain [P].

**DR-04 Accounting depth.** Options: system of record for GL vs household subledger
exporting to external accounting vs none in first scope. Recommendation: none in first
scope; subledger later. Deferral: UC-21–UC-24 cannot be specified.

**DR-05 Integrations.** Payment processor, bank, screening, listing, e-signature,
messaging, agencies. Options: manual entry vs integration per party. Recommendation: manual
in first scope; Architecture compatibility review for any integration. Owner: product +
platform authority.

**DR-06 Approval limits and separation of duties.** Question: limits for pricing,
spending, refunds; allowed role combinations at small properties; who checks whom.
Example: one-person office — who verifies a vendor bank-detail change? Recommendation:
route checks to ownership or another property (CAP-4). Deferral: SOD rules remain [P].

**DR-07 Configurable target defaults.** Options: ship with no defaults (must be set
before use) vs authority supplies portfolio defaults. Recommendation: authority supplies;
legal deadlines override. Deferral: CT-* unusable; QT-08 unmeasurable.

**DR-08 Quality thresholds.** Supply QT values, measurement windows, essential-function
list. Example shown in QT-01. Recommendation: confirm QT-05 candidate list first.
Owner: product + platform authority. Deferral: G1 cannot pass.

**DR-09 Retention and legal hold.** Retention periods per record type; who may impose
and lift a hold. Owner: product authority with counsel. Deferral: disposal disabled.

**DR-10 Legal content ownership.** Who supplies and reviews policy versions (screening
criteria, notice wording, animals, occupancy)? The application only stores reviewed
versions (CCR-07). Recommendation: named counsel reviewer. Deferral: L items blocked.

**DR-11 Field use.** Do technicians/vendors need on-site use? Profile has no mobile
client. Owner: Experience/Architecture compatibility, then product authority.

**DR-12 Sensitive data access.** Who is ACT-ACR; who may view consumer reports,
survivor information, interior photos? Recommendation: ACT-ACR a named designated
capacity; consumer reports limited to decision approvers.

**DR-13 Tenancy and owners.** One management organisation with multiple owners? Owner
visibility of individual households? Recommendation: confirm hierarchy owner → property;
owner aggregate-only.

## 9. Decisions log and change log

| Item | Disposition |
|---|---|
| DR-01 … DR-13 | open; no authority in run EVAL-050-01 |
| Assumptions | narrative is generic U.S. (N0.1); no jurisdiction selected |
| Change log | r1 initial; no superseded IDs |

## 10. Self-check

| Check ID | Subject | Outcome | Evidence |
|---|---|---|---|
| SC-01 source traceability | every UC/CCR/DC | pass | N-codes on each row |
| SC-02 scenario coverage | every UC has ≥1 scenario; negative/denied/boundary where relevant | pass | §4 |
| SC-03 failure semantics | checklist mapped | pass | §2.1 |
| SC-04 disclosure surfaces | applied | pass | ACTORS §3.2 |
| SC-05 threshold consistency | values absent; windows requested | not_run (values absent) | §5, DR-08 |
| SC-06 untagged [K] | none | pass | — |
| SC-07 G1 | not claimed | — | discovery mode |
