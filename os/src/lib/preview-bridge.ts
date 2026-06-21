/**
 * P1E — Shared preview bridge protocol (canonical message contract).
 *
 * The exact postMessage contract spoken between the OS BrandWorkspace
 * (parent / control plane) and the secure preview iframe (rendering plane).
 *
 * Behaviour is UNCHANGED from P1D — this module only centralises the
 * contract so the message `type` literals are no longer duplicated inline.
 * The string values are authoritative and must never drift.
 */

// Parent (OS control plane) → iframe (rendering plane)
export type PreviewOutboundMsg =
  | { type: "PREVIEW_INIT"; origin: string; editMode: boolean }
  | { type: "EDIT_MODE"; enabled: boolean }
  | { type: "HIGHLIGHT_SECTION"; sectionId: string };

// iframe (rendering plane) → parent (OS control plane)
export type PreviewInboundMsg =
  | { type: "SECTION_CLICK"; sectionId: string; field: string }
  | { type: "FIELD_CHANGE"; sectionId: string; field: string; value: string }
  | { type: "PREVIEW_READY" };

export const PREVIEW_MESSAGE_TYPES = {
  // outbound (parent → iframe)
  PREVIEW_INIT: "PREVIEW_INIT",
  EDIT_MODE: "EDIT_MODE",
  HIGHLIGHT_SECTION: "HIGHLIGHT_SECTION",
  // inbound (iframe → parent)
  SECTION_CLICK: "SECTION_CLICK",
  FIELD_CHANGE: "FIELD_CHANGE",
  PREVIEW_READY: "PREVIEW_READY",
} as const;
