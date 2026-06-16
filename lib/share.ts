import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { PlogConfig } from "./types";

const HASH_PREFIX = "#c=";

export function encodeConfig(config: PlogConfig): string {
  return compressToEncodedURIComponent(JSON.stringify(config));
}

export function decodeConfig(encoded: string): PlogConfig | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.version === 1 &&
      Array.isArray(parsed.sections)
    ) {
      return parsed as PlogConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function shareUrl(config: PlogConfig): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  // Drop the (potentially large) logo image so links stay short and copyable;
  // logos travel via JSON export instead.
  const { logo, ...shareable } = config;
  void logo;
  return `${base}${HASH_PREFIX}${encodeConfig(shareable as PlogConfig)}`;
}

/** Reads a config from the current URL fragment, if present and valid. */
export function configFromHash(): PlogConfig | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  return decodeConfig(hash.slice(HASH_PREFIX.length));
}

export function clearHash() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
