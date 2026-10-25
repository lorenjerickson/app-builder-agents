// Additive business schema. No data reset, fixture load or destructive down migration.
exports.up = (pgm) => {
  pgm.sql(`
CREATE TABLE accounts (
 id uuid PRIMARY KEY, provider_subject text UNIQUE NOT NULL,
 display_label text NOT NULL CHECK (display_label IN ('Member A','Member B','Custodian')),
 role text NOT NULL CHECK (role IN ('member','custodian'))
);
CREATE TABLE equipment (
 id uuid PRIMARY KEY, inventory_code text UNIQUE NOT NULL,
 name text NOT NULL CHECK (name = btrim(name) AND char_length(name) BETWEEN 1 AND 80),
 description text NOT NULL CHECK (char_length(description) <= 500), maintenance boolean NOT NULL
);
CREATE TABLE loans (
 id uuid PRIMARY KEY, equipment_id uuid NOT NULL REFERENCES equipment ON DELETE RESTRICT,
 borrower_id uuid NOT NULL REFERENCES accounts ON DELETE RESTRICT,
 checked_out_at timestamptz NOT NULL, returned_at timestamptz,
 CHECK (returned_at IS NULL OR returned_at >= checked_out_at)
);
CREATE UNIQUE INDEX one_active_loan_per_item ON loans(equipment_id) WHERE returned_at IS NULL;
CREATE INDEX own_loan_history ON loans(borrower_id,checked_out_at DESC,id DESC);
CREATE TABLE operations (
 actor_id uuid NOT NULL REFERENCES accounts ON DELETE RESTRICT,
 key text NOT NULL CHECK (char_length(key) BETWEEN 1 AND 128 AND key COLLATE "C" ~ '^[ -~]+$'),
 type text NOT NULL CHECK (type IN ('checkout','return','set_maintenance')),
 target uuid NOT NULL, canonical_intent text NOT NULL, intent_digest text NOT NULL CHECK (intent_digest ~ '^[0-9a-f]{64}$'),
 http_status integer CHECK (http_status IN (200,201,404,409)), outcome jsonb,
 original_correlation_id uuid NOT NULL, completed_at timestamptz,
 PRIMARY KEY(actor_id,key)
);
CREATE TABLE audit_events (
 id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES accounts ON DELETE RESTRICT,
 equipment_id uuid NOT NULL REFERENCES equipment ON DELETE RESTRICT,
 loan_id uuid REFERENCES loans ON DELETE RESTRICT,
 action text NOT NULL CHECK (action IN ('checkout','return','maintenance_started','maintenance_ended')),
 occurred_at timestamptz NOT NULL, correlation_id uuid NOT NULL, operation_key text NOT NULL,
 FOREIGN KEY(actor_id,operation_key) REFERENCES operations(actor_id,key) ON DELETE RESTRICT,
 UNIQUE(actor_id,operation_key), UNIQUE(loan_id,action),
 CHECK ((action IN ('checkout','return')) = (loan_id IS NOT NULL))
);
CREATE INDEX audit_history ON audit_events(occurred_at DESC,id DESC);
CREATE INDEX item_audit_history ON audit_events(equipment_id,occurred_at DESC,id DESC);
CREATE FUNCTION bb_immutable_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable history' USING ERRCODE='23514'; END $$;
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION bb_immutable_history();
CREATE TRIGGER accounts_immutable BEFORE UPDATE OR DELETE ON accounts FOR EACH ROW EXECUTE FUNCTION bb_immutable_history();
CREATE FUNCTION bb_equipment_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'immutable equipment' USING ERRCODE='23514'; END IF;
 IF (NEW.id,NEW.inventory_code,NEW.name,NEW.description) IS DISTINCT FROM (OLD.id,OLD.inventory_code,OLD.name,OLD.description) THEN
 RAISE EXCEPTION 'immutable equipment' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER equipment_guard BEFORE UPDATE OR DELETE ON equipment FOR EACH ROW EXECUTE FUNCTION bb_equipment_guard();
CREATE FUNCTION bb_loan_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'immutable loan' USING ERRCODE='23514'; END IF;
 IF TG_OP = 'UPDATE' AND ((NEW.id,NEW.equipment_id,NEW.borrower_id,NEW.checked_out_at) IS DISTINCT FROM
 (OLD.id,OLD.equipment_id,OLD.borrower_id,OLD.checked_out_at) OR OLD.returned_at IS NOT NULL) THEN
 RAISE EXCEPTION 'immutable loan' USING ERRCODE='23514'; END IF;
 PERFORM 1 FROM equipment WHERE id=NEW.equipment_id FOR UPDATE;
 RETURN NEW;
END $$;
CREATE TRIGGER loan_guard BEFORE INSERT OR UPDATE OR DELETE ON loans FOR EACH ROW EXECUTE FUNCTION bb_loan_guard();
CREATE FUNCTION bb_consistent_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE item uuid;
BEGIN
 IF TG_TABLE_NAME = 'equipment' THEN item := NEW.id; ELSE item := NEW.equipment_id; END IF;
 IF EXISTS (SELECT 1 FROM equipment e JOIN loans l ON l.equipment_id=e.id AND l.returned_at IS NULL WHERE e.id=item AND e.maintenance) THEN
 RAISE EXCEPTION 'inconsistent equipment state' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER equipment_consistency AFTER INSERT OR UPDATE ON equipment DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION bb_consistent_item();
CREATE CONSTRAINT TRIGGER loan_consistency AFTER INSERT OR UPDATE ON loans DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION bb_consistent_item();
CREATE FUNCTION bb_operation_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'immutable operation' USING ERRCODE='23514'; END IF;
 IF OLD.completed_at IS NOT NULL OR (NEW.actor_id,NEW.key,NEW.type,NEW.target,NEW.canonical_intent,NEW.intent_digest,NEW.original_correlation_id)
 IS DISTINCT FROM (OLD.actor_id,OLD.key,OLD.type,OLD.target,OLD.canonical_intent,OLD.intent_digest,OLD.original_correlation_id) THEN
 RAISE EXCEPTION 'immutable operation' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER operation_guard BEFORE UPDATE OR DELETE ON operations FOR EACH ROW EXECUTE FUNCTION bb_operation_guard();
CREATE FUNCTION bb_terminal_operation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE op operations; event_count integer;
BEGIN
 SELECT * INTO op FROM operations WHERE actor_id=NEW.actor_id AND key=NEW.key;
 IF op.http_status IS NULL OR op.outcome IS NULL OR op.completed_at IS NULL OR
 NOT (op.outcome ?& ARRAY['key','type','target','outcome','code','changed','result','completedAt','originalCorrelationId']) OR
 op.outcome->>'key' IS DISTINCT FROM op.key OR op.outcome->>'type' IS DISTINCT FROM op.type OR
 op.outcome->>'target' IS DISTINCT FROM op.target::text OR
 op.outcome->>'originalCorrelationId' IS DISTINCT FROM op.original_correlation_id::text OR
 (op.outcome->>'completedAt')::timestamptz IS DISTINCT FROM op.completed_at OR
 op.outcome->>'outcome' NOT IN ('succeeded','conflict','not_found') THEN
 RAISE EXCEPTION 'operation must be terminal' USING ERRCODE='23514'; END IF;
 SELECT count(*) INTO event_count FROM audit_events WHERE actor_id=op.actor_id AND operation_key=op.key;
 IF (op.outcome->>'changed')::boolean IS TRUE AND event_count <> 1 OR
 (op.outcome->>'changed')::boolean IS NOT TRUE AND event_count <> 0 THEN
 RAISE EXCEPTION 'operation audit mismatch' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER operation_terminal AFTER INSERT OR UPDATE ON operations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION bb_terminal_operation();
REVOKE ALL ON accounts,equipment,loans,operations,audit_events FROM PUBLIC;
  `);
};
exports.down = () => { throw new Error('Business history is retained. Roll back the compatible application image; restore only to a separately authorized disposable target.'); };
