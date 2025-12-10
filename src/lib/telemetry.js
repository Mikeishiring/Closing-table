/**
 * Minimal telemetry helper
 * Replace console logging with real analytics when available.
 */
export function track(event, data = {}) {
  try {
    // Keep payload small and structured for future providers.
    console.info('[telemetry]', event, data);
  } catch {
    // Best-effort logging only.
  }
}

