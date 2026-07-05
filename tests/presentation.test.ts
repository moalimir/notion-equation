import { describe, expect, it } from "vitest";
import { presentResult } from "../src/popup/presentation";

describe("popup result presentation", () => {
  it("reports an empty page without treating it as an error", () => {
    expect(
      presentResult({ status: "completed", converted: 0, skipped: 0, failed: 0 }),
    ).toEqual({ text: "No supported equations were found.", tone: "neutral" });
  });

  it("reports successful and partial conversions", () => {
    expect(
      presentResult({ status: "completed", converted: 2, skipped: 0, failed: 0 }).tone,
    ).toBe("success");
    expect(
      presentResult({ status: "completed", converted: 2, skipped: 0, failed: 1 }).tone,
    ).toBe("warning");
  });

  it("surfaces unsupported-page guidance", () => {
    expect(
      presentResult({
        status: "unsupported",
        converted: 0,
        skipped: 0,
        failed: 0,
        message: "Open Notion.",
      }),
    ).toEqual({ text: "Open Notion.", tone: "error" });
  });
});
