"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import type { PaymentClaimRow, ClaimStatus } from "@/lib/db/payments";

const COLS =
  "id, brand_key, program_name, amount_xaf, payunit_url, claimant_name, claimant_phone, claimant_email, proof_url, status, source, verified_by, verified_at, created_at";

export async function listClaims(brandKey: string): Promise<PaymentClaimRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("payment_claims")
    .select(COLS)
    .eq("brand_key", brandKey)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PaymentClaimRow[];
}

export async function createClaim(input: {
  brandKey: string;
  programName: string;
  amountXaf?: number | null;
  claimantName?: string;
  claimantPhone?: string;
  claimantEmail?: string;
  proofUrl?: string;
}): Promise<{ id: string } | { error: string }> {
  if (!input.programName.trim()) return { error: "Program name is required." };
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("payment_claims")
    .insert({
      brand_key: input.brandKey,
      program_name: input.programName.trim(),
      amount_xaf: input.amountXaf ?? null,
      claimant_name: input.claimantName?.trim() || null,
      claimant_phone: input.claimantPhone?.trim() || null,
      claimant_email: input.claimantEmail?.trim() || null,
      proof_url: input.proofUrl?.trim() || null,
      status: "claimed",
      source: "manual",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await notify(
    "payment_claim",
    input.brandKey,
    [
      `📚 ${input.programName}`,
      input.amountXaf ? `💰 ${input.amountXaf.toLocaleString()} XAF` : "",
      input.claimantName ? `👤 ${input.claimantName}` : "",
      input.claimantPhone ? `📞 ${input.claimantPhone}` : "",
    ].filter(Boolean),
    `/payments`
  );

  revalidatePath("/payments");
  return { id: data!.id as string };
}

export async function setClaimStatus(id: string, status: ClaimStatus): Promise<void> {
  const db = createSupabaseAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "confirmed" || status === "rejected") {
    patch.verified_at = new Date().toISOString();
  }
  const { data: claim } = await db
    .from("payment_claims")
    .select("brand_key, program_name, amount_xaf, claimant_name")
    .eq("id", id)
    .single();

  const { error } = await db.from("payment_claims").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  if (status === "confirmed" && claim) {
    await notify(
      "payment_confirmed",
      claim.brand_key as string,
      [
        `📚 ${claim.program_name}`,
        claim.amount_xaf ? `💰 ${(claim.amount_xaf as number).toLocaleString()} XAF` : "",
        claim.claimant_name ? `👤 ${claim.claimant_name}` : "",
      ].filter(Boolean),
      `/payments`
    );
  }
  revalidatePath("/payments");
}
