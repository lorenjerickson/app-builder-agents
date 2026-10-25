# BorrowBench container delivery

This is an explicitly authorized local test deployment while Auth0 is deferred.
It does not pass real-identity, business, design, release or full pilot acceptance gates.

Use pinned Node 24.22.1 from the workspace root. Docker Desktop must run.

```sh
node tools/containers.mjs build
BORROWBENCH_ACTION_ID=unique-authorized-stage-id node tools/containers.mjs stage /absolute/path/to/release-HASH.json
BORROWBENCH_ACTION_ID=unique-authorized-promotion-id node tools/containers.mjs promote /absolute/path/to/the-same-release-HASH.json
node tools/containers.mjs status verify
node tools/containers.mjs status pilot
node tools/containers.mjs stop verify
node tools/containers.mjs stop pilot
```

Build prints its release manifest path under docs/pilot/evidence/containers. Both
images come from the same copied source snapshot and frozen pnpm install, with the
pinned Node base. Docker receives no host environment files, private .local directory,
node_modules or build output. Image source labels and the content-addressed manifest
bind source, image IDs, Compose configuration and migration file hashes. This local
image-store workflow uses immutable SHA256 image IDs, not a registry push or remote
manifest digest. Mutable build tags are never deployment inputs.

See [BUSINESS-OPERATIONS.md](BUSINESS-OPERATIONS.md) for current business setup, explicit authority and action-journal requirements. Stage operates only on verify. Promote requires the recorded staging result, checks
the running verify image IDs and health, repeats the web smoke, then starts pilot using
those exact IDs with `--no-build`. It does not copy staging database contents. Receipt
files record observed IDs, networks, volumes, loopback bindings and smoke outcomes.
Changed Compose configuration or a modified release manifest is rejected. A missing
local image requires restoration or a new build; no fallback pull/rebuild occurs.

| Target | Project | Browser | Storage |
|---|---|---|---|
| verify | borrowbench-containers-verify | http://localhost:3200 | own database volume |
| pilot | borrowbench-containers-pilot | http://localhost:3300 | different database volume |

These projects do not reuse host-mode dev/verify databases. API and database have no
host ports. Web is published only on 127.0.0.1. Each project has a web-only edge bridge for Docker loopback port publishing and two internal networks:
web/API share front; API/DB share data. Web cannot directly join the database network.
All app processes run as the image's non-root node user with read-only root filesystems,
a temporary /tmp and dropped capabilities. Databases retain their persistent volumes.
Stop preserves volumes and secrets. No reset/down-volume operation is provided.

## Container test authentication

`container-test` is distinct from `local` and `auth0`. It requires an explicit
BORROWBENCH_TEST_ONLY=1 marker, target verify/pilot and the expected container API
binding. The web additionally requires exact localhost target origin and api:3001.
Invalid combinations fail closed. Ordinary host local mode remains dev+loopback only.

Each target gets an independently generated random 256-bit test key, admin DB password and separate runtime API DB password
in `.local/containers-TARGET/`. The parent directory is mode 700. Individual files
are read-only (444) to let the non-root container process read Compose's bind-mounted
secrets; host users cannot traverse the private parent. Do not print/read these files
in agent output. They are never build arguments or image layers. The entrypoint loads
only its mounted secrets into its child process at runtime. Keys are not browser tokens.
Compose secret mounts on this local Docker host are file mounts, not an encrypted vault.
The Docker administrator is trusted and can access container secrets.

The browser can choose Member A, Member B or Custodian without a password. Cookies
are HttpOnly, SameSite=Strict and distinct for verify/pilot/host. Selection is a
same-origin POST; foreign origins are denied. NestJS receives the server key and a
fixed account ID, validates the key and owns the role mapping. A visible banner marks
all pages as test mode. Every local operator can impersonate these synthetic roles;
this is suitable only for the synthetic local pilot. It is not authentication proof.

The stage smoke checks all three identities through PostgreSQL, missing-session denial,
cookie isolation and foreign-origin denial; an internal API check verifies missing/
wrong keys, unknown identity and member/custodian access. Auth0 adapter and checks
remain in source, but this deployment deliberately uses no Auth0 configuration.

## Scope and remaining work

These are compiled deployment images, not Compose development/watch/debug images.
The current images include the workspace's installed build dependencies for simplicity;
size optimization is deferred. The Node base and lockfile are pinned, but image IDs
are recorded from the actual build rather than assuming byte-identical rebuilding.
No automatic rollback or destructive migration is provided. Manifest-bound observer/recovery/restore definitions are in BUSINESS-OPERATIONS.md; execution, independent verification, performance benchmark and controlled incident evidence remain separate prerequisites. Do not expose these containers publicly.

### Restaging an exercised verification fixture

The default `stage <release>` remains an empty-only initial seed and refuses populated business tables. For an explicitly authorized repaired-candidate restage, retain the existing verification volume and use the preserve mode below. Build a new candidate after all source repairs are frozen; never alter the original IM04 release or IM05 evidence. Deployment must first stop the verification API/web under its assigned runbook; stage refuses running applications and performs no implicit stop.

From `pilot/borrowbench`, with the new release located inside the selected evidence directory:

```sh
BORROWBENCH_RECORDS_DIR=/absolute/project/docs/pilot/implementation/BB-IMPLEMENT-01/NEW_DEPLOYMENT \
BORROWBENCH_ACTION_ID=UNIQUE_AUTHORIZED_ACTION \
node tools/containers.mjs stage /absolute/project/docs/pilot/implementation/BB-IMPLEMENT-01/NEW_DEPLOYMENT/release-NEW_HASH.json \
  --preserve-existing-fixture /absolute/project/docs/pilot/implementation/BB-IMPLEMENT-01/IM-05/fixture-receipt.json \
  --receipt-sha256 98aec3858e2a8cad8cbae2e1bc1b401760091245c33b13bedadfddbf8d305334
```

This verify-only mode validates the exact retained receipt, referenced initial inventory/state files, target and frozen fixture hash before staging. Before setup, a single read-only SQL snapshot validates all fixed account IDs/labels/roles/subject digests and equipment IDs/codes/names/descriptions. Maintenance, loans, operations and audit history may differ from the initial baseline. Provider subjects are not emitted; only their hashes are compared. Setup runs additive migrations and runtime-role provisioning, without calling the seed loader. Complete table row digests and counts must remain identical across setup before the application starts.

Evidence includes a pre-setup preserved inventory, a fixture decision and the final stage receipt. `fixtureDecision.seedExecuted=false` and `pristineBaseline=false` distinguish retained state from a fresh seed. Actual counts and table digests are captured at execution; the initial receipt does not certify the current state as pristine. Any mismatch fails closed with no reset, truncate, reseed or fallback. Preserve the failure evidence and route to Coordinator. PostgreSQL execution and preservation proof require Deployment verification; developer tests mock only the command boundary.
