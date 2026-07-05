import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("development manifest", () => {
  it("uses the Chrome-only, on-demand permission model", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
    ) as {
      manifest_version: number;
      version: string;
      permissions?: string[];
      host_permissions?: string[];
      content_scripts?: unknown[];
      action?: { default_popup?: string };
      commands?: Record<string, unknown>;
    };

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.action?.default_popup).toBe("popup.html");
    expect(manifest.permissions?.sort()).toEqual(["activeTab", "scripting"]);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.content_scripts).toBeUndefined();
    expect(manifest.commands).toHaveProperty("convert-page");
  });
});
