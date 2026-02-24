/**
 * Types pour les offres de réservation (Owner → Seeker)
 */

export type OfferStatus = "pending" | "paid" | "refused" | "expired";

export type Offer = {
  id: string;
  conversation_id: string;
  demande_id: string;
  owner_id: string;
  seeker_id: string;
  salle_id: string;
  amount_cents: number;
  payment_mode: "full" | "split";
  upfront_amount_cents: number;
  balance_amount_cents: number;
  balance_due_at: string | null;
  payment_plan_status:
    | "pending_deposit"
    | "deposit_paid"
    | "balance_scheduled"
    | "balance_paid"
    | "balance_failed"
    | "fully_paid"
    | "expired_unpaid";
  upfront_paid_at: string | null;
  balance_payment_intent_id: string | null;
  balance_last_error: string | null;
  balance_retry_count: number;
  balance_paid_at: string | null;
  deposit_amount_cents: number;
  service_fee_cents: number;
  deposit_refunded_cents: number;
  deposit_status: "none" | "held" | "partially_refunded" | "refunded";
  deposit_payment_intent_id: string | null;
  deposit_hold_status: string;
  deposit_claim_amount_cents: number;
  deposit_claim_reason: string | null;
  deposit_claim_requested_at: string | null;
  deposit_released_at: string | null;
  deposit_captured_at: string | null;
  expires_at: string;
  status: OfferStatus;
  message: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OfferRow = {
  id: string;
  conversation_id: string;
  demande_id: string;
  owner_id: string;
  seeker_id: string;
  salle_id: string;
  amount_cents: number;
  payment_mode: "full" | "split";
  upfront_amount_cents: number;
  balance_amount_cents: number;
  balance_due_at: string | null;
  payment_plan_status:
    | "pending_deposit"
    | "deposit_paid"
    | "balance_scheduled"
    | "balance_paid"
    | "balance_failed"
    | "fully_paid"
    | "expired_unpaid";
  upfront_paid_at: string | null;
  balance_payment_intent_id: string | null;
  balance_last_error: string | null;
  balance_retry_count: number;
  balance_paid_at: string | null;
  deposit_amount_cents: number;
  service_fee_cents: number;
  deposit_refunded_cents: number;
  deposit_status: "none" | "held" | "partially_refunded" | "refunded";
  deposit_payment_intent_id: string | null;
  deposit_hold_status: string;
  deposit_claim_amount_cents: number;
  deposit_claim_reason: string | null;
  deposit_claim_requested_at: string | null;
  deposit_released_at: string | null;
  deposit_captured_at: string | null;
  expires_at: string;
  status: OfferStatus;
  message: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};
