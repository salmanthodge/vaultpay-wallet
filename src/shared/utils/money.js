import crypto from 'node:crypto';

/**
 * Money helpers (pure — no Prisma). Amounts are decimal strings with up to 4
 * fractional digits; arithmetic on balances happens atomically in the repository
 * via Prisma's Decimal `increment`/`decrement`, never with JS floats.
 */
export const AMOUNT_DECIMALS = 4;
export const MAX_AMOUNT = 1_000_000_000;

const AMOUNT_RE = /^\d+(\.\d{1,4})?$/;

/** True for a positive monetary amount with ≤ 4 decimal places, within bounds. */
export const isValidAmount = (value) => {
  if (value === null || value === undefined) return false;
  const s = String(value).trim();
  if (!AMOUNT_RE.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 && n <= MAX_AMOUNT;
};

/** Normalize a Decimal-like value to a string (for API output). */
export const formatAmount = (value) =>
  value === null || value === undefined ? null : value.toString();

/** Generate an opaque idempotency reference when the client doesn't supply one. */
export const generateReference = () => `ref_${crypto.randomBytes(12).toString('hex')}`;
