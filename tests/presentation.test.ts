import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { presentResult } from "../src/popup/presentation";

describe("popup result presentation", () => {
  it("reports an empty page without treating it as an error", () => {
    assert.deepEqual(
      presentResult({ status: "completed", converted: 0, skipped: 0, failed: 0 }),
      { text: "No supported equations were found.", tone: "neutral" },
    );
  });

  it("reports successful and partial conversions", () => {
    assert.equal(
      presentResult({ status: "completed", converted: 2, skipped: 0, failed: 0 }).tone,
      "success",
    );
    assert.equal(
      presentResult({ status: "completed", converted: 2, skipped: 0, failed: 1 }).tone,
      "warning",
    );
  });

  it("surfaces unsupported-page guidance", () => {
    assert.deepEqual(
      presentResult({
        status: "unsupported",
        converted: 0,
        skipped: 0,
        failed: 0,
        message: "Open Notion.",
      }),
      { text: "Open Notion.", tone: "error" },
    );
  });
});
