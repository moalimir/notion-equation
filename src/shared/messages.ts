import type { ConversionResult } from "./contracts";

export const CONVERT_MESSAGE = "notion-equation/convert";

export interface ConvertMessage {
  type: typeof CONVERT_MESSAGE;
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
