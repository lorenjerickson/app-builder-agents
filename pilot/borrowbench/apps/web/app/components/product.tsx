/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation intentionally remounts protected actor context; Auth0 routes require document navigation. */
"use client";

import { useEffect, useRef, useState } from "react";
import { actionPath, resultCopy, stateLabel, terminalReceipt, validIntent } from "@/lib/product-contract";
import type { ActionReply, AuditEvent, AuditList, Equipment, EquipmentSummary, Intent, Loan, MyLoans, Receipt } from "@/lib/product-contract";

type Identity = { actor: string; label: string; role: "member" | "custodian"; csrf: string; local: boolean; mode: string };
type View = "equipment" | "item" | "loans" | "loan" | "history" | "missing";
type ReadData = { items?: Equipment[]; item?: Equipment; loans?: MyLoans; loan?: Loan; history?: AuditList };
type ActionState = { intent: Intent; phase: "pending" | "unknown" | "checking" | "terminal" | "denied" | "session" | "invalid" | "key_reuse"; receipt?: Receipt; historical?: boolean; checked?: boolean };
class ReadError extends Error { constructor(public status: number) { super("Read unavailable"); } }
function timestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}
function Time({ value }: { value: string }) { return <time dateTime={value}>{timestamp(value)}</time>; }
function observe(state: string, operationId?: string) {
  const names: Record<string, string> = { checkout: "checkoutEquipment", return: "returnOwnLoan", set_maintenance: "setMaintenance" };
  window.dispatchEvent(new CustomEvent("borrowbench:ui-outcome", { detail: { state, ...(operationId ? { operationId: names[operationId] ?? operationId } : {}) } }));
}
function focusHeading() { requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus()); }

export function Product({ identity, screen }: { identity: Identity; screen: string[] }) {
  const [first, id] = screen;
  const view: View = !first || first === "equipment" ? (id ? "item" : "equipment") : first === "loans" ? (id ? "loan" : "loans") : first === "history" ? "history" : "missing";
  const [data, setData] = useState<ReadData>({});
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<number | null>(null);
  const [pageError, setPageError] = useState(false);
  const [paging, setPaging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [action, setAction] = useState<ActionState | null>(null);
  const [restored, setRestored] = useState<Intent | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const requestNumber = useRef(0);
  const active = useRef(true);
  const sending = useRef(false);
  const storageKey = `borrowbench.intent.v1.${identity.actor}`;
  const historyHeading = useRef<HTMLHeadingElement>(null);
  function rememberFocus(elementId: string, path = window.location.pathname) {
    try { sessionStorage.setItem(`borrowbench.focus.${identity.actor}`, JSON.stringify({ path: path === "/" ? "/equipment" : path, elementId })); } catch { /* Focus fallback does not authorize a mutation. */ }
  }
  function restoreFocus() {
    requestAnimationFrame(() => {
      try {
        const key = `borrowbench.focus.${identity.actor}`;
        const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
        if (saved?.path === (window.location.pathname === "/" ? "/equipment" : window.location.pathname)) {
          sessionStorage.removeItem(key);
          const control = document.getElementById(saved.elementId);
          if (control && !(control instanceof HTMLButtonElement && control.disabled)) { control.focus(); return; }
        }
      } catch { /* A missing context always falls back to the new heading. */ }
      document.querySelector<HTMLElement>("main h1")?.focus();
    });
  }
  const pageButton = useRef<HTMLButtonElement>(null);

  async function read(path: string, signal?: AbortSignal) {
    const response = await fetch(`/api/v1${path}`, { cache: "no-store", headers: { "X-BorrowBench-Actor": identity.actor }, signal: signal ?? AbortSignal.timeout(8000) });
    if (!response.ok) throw new ReadError(response.status);
    return response.json();
  }
  async function load(filter = available) {
    const number = ++requestNumber.current;
    setLoading(true); setError(null); setPageError(false); observe("read_loading");
    try {
      let next: ReadData;
      if (view === "equipment") next = { items: (await read(`/equipment?availableOnly=${filter}`)).items };
      else if (view === "item") next = { item: await read(`/equipment/${encodeURIComponent(id)}`) };
      else if (view === "loans") next = { loans: await read("/loans/mine") };
      else if (view === "loan") next = { loan: await read(`/loans/${encodeURIComponent(id)}`) };
      else if (view === "history" && identity.role === "custodian") next = { history: await read("/audit-events") };
      else throw new ReadError(view === "history" ? 403 : 404);
      if (!active.current || number !== requestNumber.current) return;
      observe("read_loaded"); setData(next); setAnnouncement(view === "equipment" ? `${next.items!.length} items loaded.` : "Information loaded.");
    } catch (e) {
      if (active.current && number === requestNumber.current) {
        const status = e instanceof ReadError ? e.status : 503;
        observe("read_error"); setError(status);
        if (status === 401 || status === 403 || status === 404) setData({});
        setAnnouncement("Information could not be loaded.");
      }
    } finally { if (active.current && number === requestNumber.current) setLoading(false); }
  }
  useEffect(() => {
    active.current = true;
    const initialize = async () => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const candidate: unknown = JSON.parse(raw);
        if (validIntent(candidate, identity.actor)) setRestored(candidate);
        else sessionStorage.removeItem(storageKey);
      }
    } catch { setStorageError(true); }
    await load(false);
    restoreFocus();
    };
    void initialize();
    const revisit = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener("pageshow", revisit);
    // Full page navigation mounts a fresh actor-bound workspace. No automatic mutation replay.
    return () => { active.current = false; window.removeEventListener("pageshow", revisit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function more() {
    if (paging) return;
    const cursor = data.loans?.nextReturnedCursor ?? data.history?.nextCursor;
    if (!cursor) return;
    const number = requestNumber.current;
    setPaging(true); setPageError(false);
    try {
      const page = await read(`${view === "loans" ? "/loans/mine" : "/audit-events"}?cursor=${encodeURIComponent(cursor)}`);
      if (!active.current || number !== requestNumber.current) return;
      if (view === "loans") {
        const next = page as MyLoans;
        setData(previous => ({ loans: { ...next, returned: [...previous.loans!.returned, ...next.returned.filter(row => !previous.loans!.returned.some(old => old.id === row.id))] } }));
        setAnnouncement(`${next.returned.length} returned loans added.`);
        if (!next.nextReturnedCursor) requestAnimationFrame(() => historyHeading.current?.focus());
      } else {
        const next = page as AuditList;
        setData(previous => ({ history: { ...next, events: [...previous.history!.events, ...next.events.filter(row => !previous.history!.events.some(old => old.id === row.id))] } }));
        setAnnouncement(`${next.events.length} history records added.`);
        if (!next.nextCursor) requestAnimationFrame(() => historyHeading.current?.focus());
      }
    } catch (e) {
      if (active.current && e instanceof ReadError && [401, 403].includes(e.status)) { setData({}); setError(e.status); focusHeading(); }
      else if (active.current) { setPageError(true); setAnnouncement("Older records are unavailable. Your loaded records are still shown."); requestAnimationFrame(() => pageButton.current?.focus()); }
    } finally { if (active.current) setPaging(false); }
  }

  function begin(type: Intent["type"], target: string, equipment: EquipmentSummary, body: Record<string, boolean> = {}) {
    if (sending.current || restored || (action && action.phase !== "terminal")) return;
    const intent: Intent = { actor: identity.actor, type, target, body, key: crypto.randomUUID(), name: equipment.name, inventoryCode: equipment.inventoryCode };
    try { sessionStorage.setItem(storageKey, JSON.stringify(intent)); }
    catch { setStorageError(true); return; }
    rememberFocus(`${type}-${target}`);
    setRestored(intent);
    void send(intent, false);
  }
  async function send(intent: Intent, lookup: boolean, historical = false) {
    if (sending.current || !validIntent(intent, identity.actor)) return;
    sending.current = true; observe(lookup ? "checking" : "pending", { checkout: "checkoutEquipment", return: "returnOwnLoan", set_maintenance: "setMaintenance" }[intent.type]);
    setAction({ intent, phase: lookup ? "checking" : "pending", historical });
    requestAnimationFrame(() => document.getElementById("pending-action")?.focus());
    setAnnouncement(lookup ? "Checking the result…" : intent.type === "checkout" ? "Borrowing…" : intent.type === "return" ? "Returning…" : "Saving…");
    try {
      const response = await fetch(`/api/v1${lookup ? "/operations/lookup" : actionPath(intent)}`, {
        method: lookup ? "GET" : intent.type === "set_maintenance" ? "PUT" : "POST",
        headers: { "X-BorrowBench-Actor": identity.actor, "Content-Type": "application/json", "Idempotency-Key": intent.key, "X-CSRF-Token": identity.csrf, "X-Correlation-ID": crypto.randomUUID() },
        body: lookup ? undefined : JSON.stringify(intent.body), cache: "no-store", signal: AbortSignal.timeout(8000),
      });
      const reply = await response.json() as ActionReply;
      if (!active.current) return;
      const receipt = terminalReceipt(reply, response.status, intent, lookup);
      if (receipt) {
        try { sessionStorage.removeItem(storageKey); } catch { /* Retained context can safely be looked up again. */ }
        observe(receipt.outcome, intent.type); setRestored(null);
        setAction({ intent, phase: "terminal", receipt, historical: lookup || historical });
        setAnnouncement(resultCopy(receipt, intent, lookup || historical));
      } else {
        const phase = response.status === 401 ? "session" : response.status === 403 ? "denied" : reply.error?.code === "KEY_REUSE" ? "key_reuse" : [400, 413].includes(response.status) ? "invalid" : "unknown";
        observe(phase, intent.type); setAction({ intent, phase, checked: lookup, historical });
        setAnnouncement(phase === "unknown" ? "We couldn't confirm whether your change completed." : "This action needs your attention.");
      }
    } catch {
      if (active.current) { setAction({ intent, phase: "unknown", checked: lookup, historical }); setAnnouncement("We couldn't confirm whether your change completed."); }
    } finally {
      sending.current = false;
      if (active.current) focusHeading();
    }
  }
  function resume() { if (restored) { setAction({ intent: restored, phase: "unknown" }); focusHeading(); } }
  function refreshResource() { setAction(null); void load().then(restoreFocus); }
  const busy = action?.phase === "pending" || action?.phase === "checking";
  const locked = !!restored || !!busy || !!error || loading;
  const title = view === "equipment" ? "Equipment" : view === "loans" ? "My Loans" : view === "history" ? "Team history" : view === "item" ? data.item ? `${data.item.name}${data.item.state === "maintenance" || identity.role === "custodian" && data.item.state === "available" ? ` · ${stateLabel[data.item.state]}` : ""}` : "Equipment" : view === "loan" ? data.loan?.equipment.name ?? "Loan" : "Page not found";

  function loanCard(loan: Loan) {
    return <article className="loan-card" key={loan.id}>
      <p className="secondary">{loan.equipment.inventoryCode} · Borrowed <Time value={loan.checkedOutAt} /></p>
      <h3>{loan.equipment.name}</h3>
      <p className="state">{loan.state === "active" ? "Active" : "Returned"}</p>
      {loan.returnedAt && <p className="secondary">Returned <Time value={loan.returnedAt} /></p>}
      {loan.state === "active" && <button id={`return-${loan.id}`} className="primary" disabled={locked} onClick={() => begin("return", loan.id, loan.equipment)}>Return<span className="sr-only"> {loan.equipment.name}</span></button>}
    </article>;
  }
  function auditRow(event: AuditEvent) {
    const verb = { checkout: "borrowed", return: "returned", maintenance_started: "marked for maintenance:", maintenance_ended: "made available:" }[event.action];
    return <article className="audit-row" key={event.id}><p className="secondary"><Time value={event.occurredAt} /></p><p>{event.actor.displayLabel} {verb} {event.equipment.name} ({event.equipment.inventoryCode}).</p></article>;
  }

  if (error === 401 || action?.phase === "session") return <main className="entry"><div className="wordmark">BorrowBench</div><p className="secondary">{identity.local ? "Local test mode" : "Signed out"}</p><h1 tabIndex={-1}>Your session has ended</h1><p>{identity.local ? "Choose your local test account to continue." : "Sign in again to continue."} Your previous request will not be sent again automatically.</p><a className="button primary" href={identity.local ? "/" : "/auth/login"}>{identity.local ? "Choose test account" : "Sign in"}</a></main>;
  return <>
    <a className="skip-link" href="#main" hidden={leaving}>Skip to content</a>
    <header className="app-header" hidden={leaving}>
      <div className="wordmark">BorrowBench</div>
      <p className="account-notice">{identity.label} · {identity.local ? identity.mode === "container-test" ? "Container test mode · Local test account" : "Local test account" : "Pilot account"}</p>
      <nav aria-label="Main navigation">
        <a className="button secondary-button" href="/equipment" aria-current={view === "equipment" || view === "item" ? "page" : undefined}>Equipment</a>
        <a className="button secondary-button" href="/loans" aria-current={view === "loans" || view === "loan" ? "page" : undefined}>My Loans</a>
        {identity.local ? <form action="/local-session" method="post" onSubmit={() => { active.current = false; setLeaving(true); }}><button name="account" value="logout">Sign out</button></form> : <a className="button secondary-button" href="/auth/logout" onClick={() => { active.current = false; setLeaving(true); }}>Sign out</a>}
        {identity.role === "custodian" && <a className="button secondary-button" href="/history" aria-current={view === "history" ? "page" : undefined}>Team history</a>}
      </nav>
    </header>
    <div role="status" aria-live="polite" className="sr-only">{announcement}</div>
    <main id="main" aria-busy={loading || busy || leaving}>
      {leaving ? <h1 tabIndex={-1}>Leaving your account…</h1> : action && action.intent.type !== "checkout" && (action.phase === "pending" || action.phase === "unknown") ? <>
        <h1 tabIndex={-1}>{action.phase === "pending" ? action.intent.type === "return" ? `Returning ${action.intent.name}…` : action.intent.body.enabled ? "Saving maintenance status…" : "Restoring availability…" : action.checked ? action.intent.type === "return" ? "The return result is still unknown" : "The maintenance result is still unknown" : action.intent.type === "return" ? "Your return is not confirmed" : action.intent.body.enabled ? "Maintenance is not confirmed" : "Availability change is not confirmed"}</h1>
        <p>{action.phase === "pending" ? action.intent.type === "return" ? "Please wait while we check the result of your return." : `Please wait while we check whether ${action.intent.name} was ${action.intent.body.enabled ? "marked for maintenance" : "made available"}.` : action.checked ? action.intent.type === "return" ? "We could not find a completed result yet. You can check again or retry this same return safely." : "We could not find a completed result yet. You can check again or retry the same maintenance request safely." : action.intent.type === "return" ? `We lost the response for your ${action.intent.name} return. Check the result before making another request.` : action.intent.body.enabled ? "We lost the response for your maintenance request. Check the result before making another request." : `We lost the response for your request to make ${action.intent.name} available. Check the result before making another request.`}</p>
        {action.phase === "pending" ? <button id="pending-action" aria-disabled="true" className="operation-pending">{action.intent.type === "return" ? "Returning…" : "Saving…"}</button> : <>
          <button className="primary" onClick={() => void send(action.intent, true, true)}>{action.checked ? "Check again" : "Check result"}</button>
          {action.checked && <button onClick={() => void send(action.intent, false, true)}>{action.intent.type === "return" ? "Retry same return" : "Retry same request"}</button>}
        </>}
      </> : action ? <>
        <h1 tabIndex={-1}>{busy ? action.phase === "checking" ? "Checking the result…" : action.intent.type === "checkout" ? "Borrowing…" : action.intent.type === "return" ? "Returning…" : "Saving…" : action.phase === "terminal" ? resultCopy(action.receipt!, action.intent, !!action.historical) : action.phase === "denied" ? "You don't have access to this action." : action.phase === "invalid" ? "The request could not be accepted." : action.phase === "key_reuse" ? "This request could not be sent" : action.checked ? `The ${action.intent.type === "checkout" ? "borrow" : action.intent.type === "return" ? "return" : "maintenance"} result is still unknown` : "We couldn't confirm the result"}</h1>
        <p className="secondary">{action.intent.inventoryCode} · {action.intent.name}</p>
        {busy ? <><p>Please wait while we confirm your request. Leaving this page does not cancel it.</p><button id="pending-action" aria-disabled="true" className="primary">{action.phase === "checking" ? "Checking…" : action.intent.type === "checkout" ? "Borrowing…" : action.intent.type === "return" ? "Returning…" : "Saving…"}</button></> : action.phase === "terminal" ? <>
          {action.historical && <p>This is the result of your earlier action. Refresh to see current equipment and loans.</p>}
          {action.receipt!.code === "MAINTENANCE_UNCHANGED" && <p>No equipment change was needed.</p>}
          <button className="primary" onClick={refreshResource}>{action.intent.type === "return" ? "Refresh loans" : "Refresh availability"}</button>
          <a className="button" href="/loans">My Loans</a><a className="button" href="/equipment">Back to equipment</a>
        </> : action.phase === "denied" ? <><p>Your original action remains saved. You can check its result after restoring access.</p><a className="button" href="/equipment">Back to equipment</a></> : <>
          <p>{action.phase === "invalid" ? "Refresh the page before continuing. Do not start a replacement action while the original result is unknown." : action.phase === "key_reuse" ? "Its request reference belongs to a different earlier action. Check that earlier action before trying anything new." : action.checked ? `We could not find a completed result yet. You can check again or retry the same ${action.intent.type === "checkout" ? "borrow" : action.intent.type === "return" ? "return" : "maintenance"} request safely.` : "Your request may have completed. Check the result before trying anything else."}</p>
          <button className="primary" onClick={() => void send(action.intent, true, true)}>{action.phase === "key_reuse" ? "Check original result" : action.checked ? "Check again" : "Check result"}</button>
          {action.phase === "unknown" && <><button onClick={() => void send(action.intent, false, true)}>{action.checked ? `Retry same ${action.intent.type === "checkout" ? "borrow" : action.intent.type === "return" ? "return" : "maintenance request"}` : "Retry same request"}</button>{!action.checked && <p className="secondary">If the result is still unknown, check again when the service is available.</p>}</>}
          <a className="button" href="/equipment">Back to equipment</a>
        </>}
      </> : <>
        <h1 tabIndex={-1}>{error === 403 ? "You don’t have access" : error === 404 ? view === "loan" ? "Loan not found" : "Equipment not found" : error ? "We can’t reach BorrowBench" : title}</h1>
        {restored && <aside className="notice"><p>An earlier action still needs a confirmed result.</p><button onClick={resume}>Check earlier action</button></aside>}
        {storageError && <p className="error">Your browser could not save the action details. Enable session storage before borrowing or returning equipment. You can still browse.</p>}
        {error && <section><p>{error === 403 ? "This view is available to custodians." : error === 404 ? view === "loan" ? "This loan is unavailable. Open My Loans to see the loans you can access." : "We could not find this item. Browse equipment to choose another item." : "Availability may be out of date. Try refreshing in a moment."}</p>
          {error === 403 ? <a className="button primary" href="/equipment">Go to equipment</a> : error === 404 ? <a className="button primary" href={view === "loan" ? "/loans" : "/equipment"}>{view === "loan" ? "Open My Loans" : "Browse equipment"}</a> : <button className="primary" onClick={() => void load()}>Refresh</button>}
          {Object.keys(data).length > 0 && <p>Previously loaded information is shown below and may be out of date.</p>}
        </section>}
        {loading && <p role="status">{view === "equipment" ? "Loading equipment…" : "Loading information…"}</p>}
        {view === "equipment" && !error && <>
          <p className="intro">Find what you need. Borrow it when you’re ready.</p>
          <label className="filter"><input type="checkbox" checked={available} onChange={e => { setAvailable(e.target.checked); setData({}); void load(e.target.checked); }} />Available only: {available ? "on" : "off"}</label>
          {data.items && <><p className="secondary">{data.items.length} items · Inventory code order</p>
            {data.items.length === 0 ? <><p>{available ? "No available equipment right now." : "No equipment to show."}</p>{available && <button onClick={() => { setAvailable(false); void load(false); }}>Show all equipment</button>}</> : <div className="catalog">{data.items.map(item => <article className="item-card" key={item.id}><h2>{item.inventoryCode} · {item.name}</h2><p className="secondary">{stateLabel[item.state]} · {item.description}</p><a id={`item-view-${item.id}`} className="button" href={`/equipment/${item.id}`} onClick={() => rememberFocus(`item-view-${item.id}`)}>View {item.name}</a></article>)}</div>}
          </>}
        </>}
        {view === "item" && data.item && <>
          {identity.role === "member" && data.item.state !== "maintenance" ? <>
            <p className="intro">{data.item.inventoryCode} · Shared equipment</p>
            <p className="state">{stateLabel[data.item.state]}</p>
            <p>{data.item.description}</p>
          </> : <><p className="intro">{data.item.inventoryCode} · {data.item.description}{data.item.state === "maintenance" ? " This item is unavailable while in maintenance." : ""}</p>{data.item.state !== "maintenance" && !(identity.role === "custodian" && data.item.state === "available") && <p className="state">{stateLabel[data.item.state]}</p>}{identity.role === "custodian" && data.item.state === "available" && <p>Available shared equipment. Borrow only for your current account.</p>}</>}
          {data.item.state === "available" ? <button id={`checkout-${data.item.id}`} className="primary" disabled={locked || storageError} onClick={() => begin("checkout", data.item!.id, data.item!)}>Borrow</button> : data.item.state === "on_loan" ? <p>This item is currently on loan.</p> : null}
          {data.item.ownActiveLoanId && <a className="button" href={`/loans/${data.item.ownActiveLoanId}`}>View your loan</a>}
          {identity.role === "custodian" && data.item.state !== "on_loan" && <button id={`set_maintenance-${data.item.id}`} disabled={locked || storageError} onClick={() => begin("set_maintenance", data.item!.id, data.item!, { enabled: data.item!.state === "available" })}>{data.item.state === "available" ? "Mark for maintenance" : "Make available"}</button>}
          <a className="button" href="/equipment">Back to equipment</a>
        </>}
        {view === "loans" && data.loans && <>
          {data.loans.active.length === 0 && data.loans.returned.length === 0 ? <><p>Active: You have no active loans. Returned: You have no returned loans yet. Browse equipment to find something to borrow.</p><a className="button primary" href="/equipment">Browse equipment</a></> : <>
          <p className="intro">What you have now, and what you’ve returned.</p>
          <section aria-labelledby="active-heading"><h2 id="active-heading">Active</h2>{data.loans.active.length ? data.loans.active.map(loanCard) : <p>You have no active loans.</p>}</section>
          <section aria-labelledby="returned-heading"><h2 id="returned-heading" tabIndex={-1} ref={historyHeading}>Returned</h2>{data.loans.returned.length ? data.loans.returned.map(loanCard) : <p>You haven&apos;t returned any equipment yet.</p>}</section>
          <a className="button" href="/equipment">Browse equipment</a></>}
        </>}
        {view === "loan" && data.loan && <>{loanCard(data.loan)}<a className="button" href="/loans">Back to My Loans</a></>}
        {view === "history" && data.history && <>
          {data.history.events.length > 0 && <p className="intro">Equipment changes, newest first.</p>}<h2 className="sr-only" tabIndex={-1} ref={historyHeading}>History records</h2>
          {data.history.events.length ? data.history.events.map(auditRow) : <><p>There are no equipment changes to show yet. History will appear here after equipment is borrowed, returned or moved into or out of maintenance.</p><a className="button primary" href="/equipment">Browse equipment</a></>}
        </>}
        {view === "history" && !!data.history?.events.length && <a className="button" href="/equipment">Equipment care</a>}
        {(data.loans?.nextReturnedCursor || data.history?.nextCursor) && <div className="paging">{pageError && <p className="error">Older records are unavailable right now. Your loaded records are still shown.</p>}<button ref={pageButton} aria-disabled={paging} onClick={() => void more()}>{paging ? "Loading more…" : pageError ? "Try again" : "Load more"}</button></div>}
      </>}
    </main>
  </>;
}
