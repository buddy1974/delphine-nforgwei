/**
 * P1D.6: Strict SaveResult type and normalizer.
 *
 * ONLY result.ok === true counts as success.
 * Everything else — { error }, undefined, digest objects, unexpected shapes — is failure.
 *
 * Use runSave() to wrap any server action call. It never throws.
 */
export type SaveResult = { ok: true } | { ok: false; error: string };

export async function runSave(
  fn: () => Promise<unknown>
): Promise<SaveResult> {
  try {
    const result = await fn();

    // Strict positive check: only explicit { ok: true } is success
    if (
      result !== null &&
      typeof result === "object" &&
      "ok" in result &&
      (result as { ok?: unknown }).ok === true
    ) {
      return { ok: true };
    }

    // Known failure shape: { error: string }
    if (
      result !== null &&
      typeof result === "object" &&
      "error" in result
    ) {
      return {
        ok: false,
        error: String((result as { error?: unknown }).error ?? "Save failed"),
      };
    }

    // Anything else (undefined, digest object, partial payload, etc.) is failure
    return { ok: false, error: "Save failed" };
  } catch (err) {
    // Network failure, 503, thrown exception — all normalized to failure
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}
