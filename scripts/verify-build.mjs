import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outdir = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(outdir, "manifest.json"), "utf8"),
);

if (manifest.manifest_version !== 3) {
  throw new Error("Production manifest must use Manifest V3.");
}

const referencedFiles = new Set([
  manifest.action?.default_popup,
  manifest.background?.service_worker,
  ...Object.values(manifest.icons ?? {}),
  ...Object.values(manifest.action?.default_icon ?? {}),
  ...(manifest.content_scripts ?? []).flatMap((entry) => [
    ...(entry.js ?? []),
    ...(entry.css ?? []),
  ]),
]);

if (JSON.stringify([...(manifest.permissions ?? [])].sort()) !== JSON.stringify(["activeTab", "scripting"])) {
  throw new Error("Production permissions must be limited to activeTab and scripting.");
}
if (manifest.host_permissions || manifest.content_scripts) {
  throw new Error("Production build must not request persistent host access.");
}

for (const file of referencedFiles) {
  if (file) await access(path.join(outdir, file));
}

const forbiddenExtensions = new Set([".map", ".ts"]);
const files = await readdir(outdir, { recursive: true });
for (const file of files) {
  if (forbiddenExtensions.has(path.extname(file))) {
    throw new Error(`Development file included in dist/: ${file}`);
  }
}

console.log("Verified production build");
