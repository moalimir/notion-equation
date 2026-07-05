import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("development manifest", () => {
  it("uses Manifest V3 and references the popup", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
    ) as {
      manifest_version: number;
      action?: { default_popup?: string };
    };

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.action?.default_popup).toBe("popup.html");
  });
});
