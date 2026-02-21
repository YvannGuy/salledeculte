/**
 * Module consentement cookies CNIL/GDPR - DIY sans CMP externe.
 * Usage client uniquement (document/cookies).
 */

export const CONSENT_COOKIE_NAME = "site_consent";
export const CONSENT_VERSION = 1;
const MAX_AGE_DAYS = 180; // ~6 mois

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  v: number;
  ts: number;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_STATE: ConsentState = {
  v: CONSENT_VERSION,
  ts: 0,
  necessary: true,
  analytics: false,
  marketing: false,
};

function parseCookieValue(value: string): ConsentState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "v" in parsed &&
      "necessary" in parsed &&
      "analytics" in parsed &&
      "marketing" in parsed
    ) {
      return {
        v: Number((parsed as Record<string, unknown>).v) || CONSENT_VERSION,
        ts: Number((parsed as Record<string, unknown>).ts) || 0,
        necessary: Boolean((parsed as Record<string, unknown>).necessary),
        analytics: Boolean((parsed as Record<string, unknown>).analytics),
        marketing: Boolean((parsed as Record<string, unknown>).marketing),
      };
    }
  } catch {
    // invalid JSON
  }
  return null;
}

/**
 * Lit le consentement depuis le cookie (côté client).
 */
export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]+)`)
  );
  if (!match) return null;
  return parseCookieValue(match[1]);
}

/**
 * Écrit le consentement dans le cookie et émet "consent:updated".
 */
export function writeConsent(state: Partial<ConsentState>): void {
  if (typeof document === "undefined") return;
  const current = readConsent() ?? { ...DEFAULT_STATE };
  const next: ConsentState = {
    ...current,
    ...state,
    v: CONSENT_VERSION,
    ts: Date.now(),
    necessary: true, // toujours true
  };
  const value = encodeURIComponent(JSON.stringify(next));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("consent:updated", { detail: next }));
}

/**
 * Vérifie si l'utilisateur a consenti à la catégorie.
 */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const state = readConsent();
  if (!state) return false;
  return Boolean(state[category]);
}

/**
 * Retourne true si un choix a déjà été enregistré.
 */
export function hasRecordedChoice(): boolean {
  return readConsent() !== null;
}
