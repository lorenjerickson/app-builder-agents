"use client";

import { useEffect, useState } from "react";

type Status = { label: string; role: string; platform: string };
export function PlatformStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    async function check() {
      setLoading(true); setError(""); setStatus(null);
      try {
        const response = await fetch("/api/platform", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The pilot service is unavailable.");
        setStatus(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Connection failed.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void check();
    return () => controller.abort();
  }, [attempt]);
  return <section aria-labelledby="platform-heading">
    <h2 id="platform-heading">Pilot connection</h2>
    <div aria-live="polite">
      {loading && <p>Checking your pilot access…</p>}
      {status && <p>Connected as {status.label} ({status.role}). {status.platform} data is available.</p>}
      {error && <p>{error}</p>}
    </div>
    <button disabled={loading} onClick={() => setAttempt(attempt + 1)}>Check connection</button>
  </section>;
}
