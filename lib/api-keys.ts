// =============================================================================
// API key resolution — reads from NEXT_PUBLIC_* env vars at build time,
// falls back to localStorage at runtime. No API keys are bundled if unset.
// =============================================================================

const LS_PREFIX = "faroe-api-key-";

function fromEnv(key: string): string | null {
  try {
    const env = process.env as Record<string, string | undefined>;
    const v = env[key];
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function fromLocalStorage(service: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_PREFIX + service);
  } catch {
    return null;
  }
}

/** Resolve an API key — env first, localStorage fallback. */
export function getApiKey(service: string, envVar: string): string | null {
  return fromEnv(envVar) ?? fromLocalStorage(service);
}

/** Store a key in localStorage so the user can set it via browser console. */
export function setApiKey(service: string, key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PREFIX + service, key);
  } catch {
    // localStorage may be full or disabled
  }
}
