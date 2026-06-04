/** Shared types for the Payment Center. Mirrors the `payment_claims` table. */

export const CLAIM_STATUSES = [
  "claimed",
  "pending_confirmation",
  "confirmed",
  "rejected",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export interface PaymentClaimRow {
  id: string;
  brand_key: string;
  program_name: string;
  amount_xaf: number | null;
  payunit_url: string | null;
  claimant_name: string | null;
  claimant_phone: string | null;
  claimant_email: string | null;
  proof_url: string | null;
  status: ClaimStatus;
  source: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  claimed: "Claimed",
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  rejected: "Rejected",
};
