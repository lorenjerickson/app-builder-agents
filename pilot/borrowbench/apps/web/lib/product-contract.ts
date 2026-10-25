export type Equipment = { id: string; inventoryCode: string; name: string; description: string; state: "available" | "on_loan" | "maintenance"; ownActiveLoanId: string | null };
export type EquipmentSummary = Pick<Equipment, "id" | "inventoryCode" | "name">;
export type Loan = { id: string; equipment: EquipmentSummary; state: "active" | "returned"; checkedOutAt: string; returnedAt: string | null };
export type MyLoans = { active: Loan[]; returned: Loan[]; nextReturnedCursor: string | null };
export type AuditEvent = { id: string; actor: { displayLabel: string }; equipment: EquipmentSummary; action: "checkout" | "return" | "maintenance_started" | "maintenance_ended"; occurredAt: string };
export type AuditList = { events: AuditEvent[]; nextCursor: string | null };
export type Intent = { actor: string; key: string; type: "checkout" | "return" | "set_maintenance"; target: string; body: Record<string, boolean>; name: string; inventoryCode: string };
export type Receipt = { key: string; type: Intent["type"]; target: string; outcome: "succeeded" | "conflict" | "not_found"; code: string; changed: boolean; result: Record<string, string> | null; completedAt: string };
export type ActionReply = { operation?: Receipt; httpStatus?: number; error?: { code: string; message: string } };
export const stateLabel = { available: "Available", on_loan: "On loan", maintenance: "Maintenance" };
export function actionPath(intent: Intent): string {
  if (intent.type === "return") return `/loans/${intent.target}/return`;
  return `/equipment/${intent.target}/${intent.type === "checkout" ? "checkout" : "maintenance"}`;
}
export function validIntent(value: unknown, actor: string): value is Intent {
  if (!value || typeof value !== "object") return false;
  const x = value as Intent;
  return x.actor === actor && typeof x.key === "string" && /^[\x20-\x7e]{1,128}$/.test(x.key) &&
    typeof x.target === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(x.target) &&
    ["checkout", "return", "set_maintenance"].includes(x.type) && typeof x.name === "string" && typeof x.inventoryCode === "string" &&
    !!x.body && typeof x.body === "object" && (x.type === "set_maintenance" ? Object.keys(x.body).length === 1 && typeof x.body.enabled === "boolean" : Object.keys(x.body).length === 0);
}
export function receiptMatches(receipt: Receipt, intent: Intent): boolean {
  if (receipt.key !== intent.key || receipt.type !== intent.type || receipt.target !== intent.target) return false;
  if (receipt.outcome === "not_found") return receipt.code === "NOT_FOUND" && !receipt.changed;
  if (receipt.outcome === "conflict") return receipt.code === ({ checkout: "ITEM_UNAVAILABLE", return: "LOAN_ALREADY_RETURNED", set_maintenance: "ITEM_ON_LOAN" }[intent.type]) && !receipt.changed;
  if (receipt.outcome !== "succeeded" || !receipt.result) return false;
  if (intent.type === "checkout") return receipt.code === "CHECKED_OUT" && receipt.changed && typeof receipt.result.loanId === "string";
  if (intent.type === "return") return receipt.code === "RETURNED" && receipt.changed && receipt.result.loanId === intent.target;
  return receipt.result.itemId === intent.target && receipt.result.state === (intent.body.enabled ? "maintenance" : "available") &&
    ((receipt.code === "MAINTENANCE_UNCHANGED" && !receipt.changed) || (receipt.changed && receipt.code === (intent.body.enabled ? "MAINTENANCE_STARTED" : "MAINTENANCE_ENDED")));
}
export function terminalReceipt(data: ActionReply, status: number, intent: Intent, lookup: boolean): Receipt | null {
  const receipt = data.operation;
  if (!receipt || !receiptMatches(receipt, intent)) return null;
  const original = lookup ? data.httpStatus : status;
  const expected = receipt.outcome === "conflict" ? 409 : receipt.outcome === "not_found" ? 404 : intent.type === "checkout" ? 201 : 200;
  return original === expected && (!lookup || status === 200) ? receipt : null;
}
export function resultCopy(receipt: Receipt, intent: Intent, historical: boolean): string {
  if (receipt.outcome === "not_found") return intent.type === "return" ? "Loan not found." : "Equipment not found.";
  if (receipt.code === "ITEM_UNAVAILABLE") return "This item is no longer available to borrow.";
  if (receipt.code === "LOAN_ALREADY_RETURNED") return "This loan has already been returned.";
  if (receipt.code === "ITEM_ON_LOAN") return "This item is on loan and can't be marked for maintenance.";
  if (historical) return receipt.changed ? "Your earlier change completed." : "Your earlier action needed no change.";
  if (intent.type === "checkout") return `You borrowed ${intent.name}.`;
  if (intent.type === "return") return `You returned ${intent.name}.`;
  const state = intent.body.enabled ? "in maintenance" : "available";
  return `${intent.name} is ${receipt.changed ? "" : "already "}${state}.`;
}
