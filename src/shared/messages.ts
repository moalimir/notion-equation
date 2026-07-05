import type { ConversionResult } from "./contracts";

export const CONVERT_MESSAGE = "notion-equation/convert";
export const GET_SHORTCUT_RESULT_MESSAGE = "notion-equation/get-shortcut-result";

export interface ConvertMessage {
  type: typeof CONVERT_MESSAGE;
}

export interface ShortcutResultRequest {
  type: typeof GET_SHORTCUT_RESULT_MESSAGE;
  tabId: number;
}

export function isShortcutResultRequest(value: unknown): value is ShortcutResultRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ShortcutResultRequest>;
  return candidate.type === GET_SHORTCUT_RESULT_MESSAGE && typeof candidate.tabId === "number";
}

export function isConversionResult(value: unknown): value is ConversionResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ConversionResult>;
  return (
    ["completed", "busy", "unsupported", "failed"].includes(candidate.status ?? "") &&
    typeof candidate.converted === "number" &&
    typeof candidate.skipped === "number" &&
    typeof candidate.failed === "number"
  );
}
