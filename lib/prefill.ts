// Prefill entry point for the bookmarklet / share sheet / extension.
// Data arrives in the URL fragment (#s=<seller text>&u=<product url>),
// which the browser never sends to the server — the no-server-logs
// privacy design holds even for one-tap flows.

export interface PrefillData {
  sellerText?: string;
  url?: string;
}

const MAX_PREFILL_LENGTH = 10_000;

export function parsePrefillHash(hash: string): PrefillData {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return {};
  }
  const sellerText = params.get('s')?.trim().slice(0, MAX_PREFILL_LENGTH);
  const url = params.get('u')?.trim();
  return {
    sellerText: sellerText || undefined,
    url: url || undefined,
  };
}
