import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
      commands?: Record<
        string,
        { suggested_key?: { default?: string; mac?: string } }
      >;
    };

    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.version, "1.0.0");
    assert.equal(manifest.action?.default_popup, "popup.html");
    assert.deepEqual(manifest.permissions?.sort(), ["activeTab", "scripting"]);
    assert.equal(manifest.host_permissions, undefined);
    assert.equal(manifest.content_scripts, undefined);
    assert.ok(manifest.commands?.["convert-page"]);
    assert.deepEqual(manifest.commands?.["convert-page"]?.suggested_key, {
      default: "Ctrl+Shift+9",
      mac: "Command+Shift+9",
    });
  });
});
