export type ConversionStatus =
  | "completed"
  | "busy"
  | "unsupported"
  | "failed";

export interface ConversionResult {
  status: ConversionStatus;
  converted: number;
  skipped: number;
  failed: number;
  message?: string;
}
