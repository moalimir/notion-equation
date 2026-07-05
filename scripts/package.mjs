import { strFromU8, unzipSync, zipSync } from "fflate";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const release = path.join(root, "release");
const manifest = JSON.parse(await readFile(path.join(dist, "manifest.json"), "utf8"));
const archiveName = `notion-equation-${manifest.version}.zip`;
const fixedDate = new Date("2025-01-01T00:00:00.000Z");

async function collect(directory, prefix = "") {
  const archive = {};
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      Object.assign(archive, await collect(absolute, relative));
    } else {
      archive[relative] = [new Uint8Array(await readFile(absolute)), { mtime: fixedDate }];
    }
  }

  return archive;
}

await mkdir(release, { recursive: true });
const zip = zipSync(await collect(dist), { level: 9 });
await writeFile(path.join(release, archiveName), zip);

const packaged = unzipSync(zip);
const packagedFiles = Object.keys(packaged).sort();
if (!packagedFiles.includes("manifest.json")) {
  throw new Error("Release archive is missing manifest.json at its root.");
}
if (packagedFiles.some((file) => /(^|\/)(node_modules|tests?|src)\//.test(file) || /\.(ts|map)$/.test(file))) {
  throw new Error("Release archive contains development files.");
}
const packagedManifest = JSON.parse(strFromU8(packaged["manifest.json"]));
if (packagedManifest.version !== manifest.version) {
  throw new Error("Release archive manifest version does not match the build.");
}
console.log(`Packaged release/${archiveName}`);
