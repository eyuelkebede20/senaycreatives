// One-time logo prep: trim the transparent margins from assets/logo.png and
// emit a clean transparent mark (public/logo-mark.png) plus a circular favicon
// (app/icon.png). Re-run with `node scripts/prep-logo.mjs` if the source changes.
import sharp from "sharp";

const SRC = "assets/logo.png";
const PAPER = "#f4f3ee";

const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
const meta = await sharp(trimmed).metadata();

// Center the trimmed mark on a padded transparent square.
const side = Math.max(meta.width, meta.height);
const pad = Math.round(side * 0.06);
const canvas = side + pad * 2;
const square = await sharp({
  create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: trimmed, gravity: "center" }])
  .png()
  .toBuffer();

// Reusable transparent mark for the CSS circle badge (header + footer).
await sharp(square).resize(512, 512).png().toFile("public/logo-mark.png");

// Favicon: the mark on a paper-coloured circle so it reads on any tab colour.
const ICON = 256;
const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}"><circle cx="${ICON / 2}" cy="${ICON / 2}" r="${ICON / 2}" fill="${PAPER}"/></svg>`,
);
const markForIcon = await sharp(square)
  .resize(Math.round(ICON * 0.6), Math.round(ICON * 0.6), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();
await sharp(circle).composite([{ input: markForIcon, gravity: "center" }]).png().toFile("app/icon.png");

console.log(`trimmed ${meta.width}x${meta.height} -> public/logo-mark.png (512), app/icon.png (${ICON})`);
