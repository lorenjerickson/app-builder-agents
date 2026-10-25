import { readFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';

export interface Account { label: string; role: 'member' | 'custodian' }
export interface Config {
  releaseId?: string;
  configId?: string;
  authMode: 'auth0' | 'local' | 'container-test';
  localAuthKey?: string;
  databaseUrl: string;
  issuer: string;
  audience: string;
  jwksUrl: URL;
  accounts: ReadonlyMap<string, Account>;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const identity = { releaseId: env.BORROWBENCH_RELEASE_ID, configId: env.BORROWBENCH_CONFIG_ID };
  for (const value of Object.values(identity)) if (value !== undefined && !/^[a-zA-Z0-9._:-]{1,128}$/.test(value)) throw new Error('Invalid telemetry identity');
  const databaseUrl = env.DATABASE_URL;
  const mapFile = env.PILOT_ACCOUNT_MAP_FILE;
  const authMode = env.BORROWBENCH_AUTH_MODE ?? 'auth0';
  if (!databaseUrl || !['auth0', 'local', 'container-test'].includes(authMode)) throw new Error('Invalid API configuration');
  if (authMode === 'local' || authMode === 'container-test') {
    const key = env.BORROWBENCH_LOCAL_AUTH_KEY;
    const allowedTarget = authMode === 'local'
      ? env.BORROWBENCH_ENV === 'dev' && env.API_HOST === '127.0.0.1'
      : env.BORROWBENCH_TEST_ONLY === '1' && ['verify', 'pilot'].includes(env.BORROWBENCH_ENV ?? '')
        && env.API_HOST === '0.0.0.0';
    if (!allowedTarget || !key || key.length < 32 || /\s/.test(key)) throw new Error('Invalid local authentication configuration');
    return { ...identity, authMode, localAuthKey: key, databaseUrl, issuer: '', audience: '',
      jwksUrl: new URL('https://unused.invalid/'), accounts: new Map() };
  }
  if (!mapFile || !isAbsolute(mapFile)) throw new Error('Invalid API configuration');
  const issuer = env.AUTH0_ISSUER ?? 'https://dev-vaonng6ouuwr50kl.us.auth0.com/';
  const audience = env.AUTH0_AUDIENCE ?? 'https://borrowbench.local/api';
  const issuerUrl = new URL(issuer);
  if (issuerUrl.protocol !== 'https:' || issuerUrl.username || issuerUrl.password || !audience) {
    throw new Error('Invalid API configuration');
  }
  let jwksUrl = new URL('.well-known/jwks.json', issuer.endsWith('/') ? issuer : `${issuer}/`);
  if (env.TEST_JWKS_URL) {
    const override = new URL(env.TEST_JWKS_URL);
    if (env.NODE_ENV !== 'test' || !['localhost', '127.0.0.1', '[::1]'].includes(override.hostname)
      || override.protocol !== 'http:' || override.username || override.password) {
      throw new Error('Invalid API configuration');
    }
    jwksUrl = override;
  }
  const parsed: unknown = JSON.parse(readFileSync(mapFile, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid account map');
  const accounts = new Map<string, Account>();
  for (const [subject, entry] of Object.entries(parsed)) {
    if (!subject || !entry || typeof entry !== 'object' || Array.isArray(entry)
      || typeof entry.label !== 'string' || !entry.label.trim()
      || !['member', 'custodian'].includes(entry.role)) throw new Error('Invalid account map');
    accounts.set(subject, { label: entry.label, role: entry.role });
  }
  return { ...identity, authMode: 'auth0', databaseUrl, issuer, audience, jwksUrl, accounts };
}
