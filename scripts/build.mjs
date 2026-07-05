import { context } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const outdir = path.join(root, "dist");
const watching = process.argv.includes("--watch");

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

for (const file of ["manifest.json", "popup.html", "popup.css"]) {
  await cp(path.join(root, file), path.join(outdir, file));
}

const buildContext = await context({
  entryPoints: {
    content: path.join(root, "content.js"),
    popup: path.join(root, "popup.js"),
  },
  bundle: true,
  entryNames: "[name]",
  format: "iife",
  minify: !watching,
  outdir,
  sourcemap: false,
  target: "chrome109",
});

if (watching) {
  await buildContext.watch();
  console.log("Watching extension sources…");
} else {
  await buildContext.rebuild();
  await buildContext.dispose();

  const manifestPath = path.join(outdir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("Built extension in dist/");
}
