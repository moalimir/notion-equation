import { build } from "esbuild";
import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const testsDirectory = path.join(root, "tests");
const outputDirectory = path.join(root, ".test-dist");
const testFiles = (await readdir(testsDirectory))
  .filter((file) => file.endsWith(".test.ts"))
  .map((file) => path.join(testsDirectory, file));

await rm(outputDirectory, { recursive: true, force: true });
let testExitCode = 1;

try {
  await build({
    entryPoints: testFiles,
    bundle: true,
    format: "esm",
    outdir: outputDirectory,
    platform: "node",
    sourcemap: false,
    target: "node20",
  });

  const builtTests = (await readdir(outputDirectory))
    .filter((file) => file.endsWith(".test.js"))
    .map((file) => path.join(outputDirectory, file));

  testExitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--test", ...builtTests], {
      cwd: root,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });

} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}

if (testExitCode !== 0) process.exitCode = testExitCode;
