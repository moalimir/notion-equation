import type { ConversionResult } from "../shared/contracts";

export type StatusTone = "neutral" | "success" | "warning" | "error";

export interface StatusPresentation {
  text: string;
  tone: StatusTone;
}

export function presentResult(result: ConversionResult): StatusPresentation {
  if (result.status === "unsupported" || result.status === "failed") {
    return { text: result.message ?? "Conversion could not be started.", tone: "error" };
  }
  if (result.status === "busy") {
    return { text: result.message ?? "Conversion is already running.", tone: "warning" };
  }
  if (result.converted === 0 && result.failed === 0) {
    return { text: "No supported equations were found.", tone: "neutral" };
  }
  if (result.failed > 0) {
    return {
      text: `Converted ${result.converted}; ${result.failed} could not be converted.`,
      tone: "warning",
    };
  }
  return {
    text: `Converted ${result.converted} equation${result.converted === 1 ? "" : "s"}.`,
    tone: "success",
  };
}
