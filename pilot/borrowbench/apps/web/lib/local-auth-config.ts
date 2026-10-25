// Pure configuration validation; secrets are consumed only by server-only callers.
export function localAuthEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const mode = env.BORROWBENCH_AUTH_MODE ?? "auth0";
  if (mode === "auth0") return false;
  if (mode !== "local" && mode !== "container-test") throw new Error("Unknown authentication mode.");
  const key = env.BORROWBENCH_LOCAL_AUTH_KEY;
  if (!key || key.length < 32 || /\s/.test(key)) throw new Error("Invalid test authentication key.");
  if (mode === "container-test") {
    const target = env.BORROWBENCH_ENV;
    const expectedBase = target === "verify" ? "http://localhost:3200" : "http://localhost:3300";
    if (env.BORROWBENCH_TEST_ONLY !== "1" || !["verify", "pilot"].includes(target ?? "") ||
        env.APP_BASE_URL !== expectedBase || env.API_INTERNAL_URL !== "http://api:3001") {
      throw new Error("Container test authentication is not configured safely.");
    }
  } else {
    const base = new URL(env.APP_BASE_URL ?? "https://invalid.invalid");
    if (env.BORROWBENCH_ENV !== "dev" || base.protocol !== "http:" ||
        !["localhost", "127.0.0.1"].includes(base.hostname)) {
      throw new Error("Local development authentication is not configured safely.");
    }
  }
  return true;
}
export function localCookie(env: NodeJS.ProcessEnv = process.env): string {
  localAuthEnabled(env);
  return env.BORROWBENCH_AUTH_MODE === "container-test"
    ? `borrowbench_${env.BORROWBENCH_ENV}_test_account` : "borrowbench_local_account";
}
