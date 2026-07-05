import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const assetsDirectory = path.join(root, "store", "assets");

const screenshots = [
  "screenshot-01-overview.jpg",
  "screenshot-02-before-after.jpg",
  "screenshot-03-private.jpg",
];

const expected = [
  { file: "store-icon-128.png", width: 128, height: 128, format: "png" },
  ...screenshots.map((file) => ({ file, width: 1280, height: 800, format: "jpeg" })),
  { file: "promo-440x280.jpg", width: 440, height: 280, format: "jpeg" },
  { file: "marquee-1400x560.jpg", width: 1400, height: 560, format: "jpeg" },
];

if (screenshots.length < 1 || screenshots.length > 5) {
  throw new Error("Chrome Web Store requires between one and five screenshots.");
}

for (const asset of expected) {
  const bytes = await readFile(path.join(assetsDirectory, asset.file));
  let width;
  let height;

  if (asset.format === "png") {
    const signature = bytes.subarray(0, 8).toString("hex");
    if (signature !== "89504e470d0a1a0a" || bytes.subarray(12, 16).toString() !== "IHDR") {
      throw new Error(`${asset.file} must be a PNG image.`);
    }
    width = bytes.readUInt32BE(16);
    height = bytes.readUInt32BE(20);
  } else {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      throw new Error(`${asset.file} must be a JPEG image.`);
    }

    let offset = 2;
    let precision;
    let components;
    const startOfFrameMarkers = new Set([
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ]);
    while (offset < bytes.length - 9) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === undefined || marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x00 || marker === 0xff || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const segmentLength = bytes.readUInt16BE(offset + 2);
      if (startOfFrameMarkers.has(marker)) {
        precision = bytes[offset + 4];
        height = bytes.readUInt16BE(offset + 5);
        width = bytes.readUInt16BE(offset + 7);
        components = bytes[offset + 9];
        break;
      }
      offset += 2 + segmentLength;
    }

    if (precision !== 8 || components !== 3) {
      throw new Error(`${asset.file} must be an 8-bit RGB JPEG without alpha.`);
    }
  }

  if (width !== asset.width || height !== asset.height) {
    throw new Error(`${asset.file} must be ${asset.width}x${asset.height}px.`);
  }
}

console.log(`Verified ${expected.length} Chrome Web Store assets`);
