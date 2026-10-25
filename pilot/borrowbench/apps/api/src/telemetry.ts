import type { Config } from './config.js';
// Only caller-selected, bounded dimensions enter this function; no payload/header dumps.
export function telemetry(config: Pick<Config,'authMode'|'releaseId'|'configId'>, event: string, dimensions: Record<string, unknown>) {
 process.stdout.write(JSON.stringify({event,time:new Date().toISOString(),mode:config.authMode,release:config.releaseId??'unbound',config:config.configId??'unbound',...dimensions})+'\n');
}
export function operationForPath(method: string, url: string): string {
 const path=url.split('?')[0];
 const routes: [string,RegExp,string][]=[
 ['GET',/^\/v1\/equipment$/,'listEquipment'],['GET',/^\/v1\/equipment\/[^/]+$/,'getEquipment'],
 ['POST',/^\/v1\/equipment\/[^/]+\/checkout$/,'checkoutEquipment'],['GET',/^\/v1\/loans\/mine$/,'listMyLoans'],
 ['GET',/^\/v1\/loans\/[^/]+$/,'getOwnLoan'],['POST',/^\/v1\/loans\/[^/]+\/return$/,'returnOwnLoan'],
 ['PUT',/^\/v1\/equipment\/[^/]+\/maintenance$/,'setMaintenance'],['GET',/^\/v1\/audit-events$/,'listAuditEvents'],
 ['GET',/^\/v1\/operations\/lookup$/,'lookupOperation'],['GET',/^\/health\/ready$/,'readiness'],['GET',/^\/health\/live$/,'liveness'],['GET',/^\/me$/,'identity'],['GET',/^\/admin\/platform$/,'platformAdmin']];
 return routes.find(([m,p])=>m===method&&p.test(path))?.[2]??'unmatched';
}
