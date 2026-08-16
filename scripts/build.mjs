import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(projectRoot, "dist");

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });

for (const item of ["index.html", "styles.css", "data.js", "app.js", "favicon.svg", "robots.txt", "_headers"]) {
  await fs.copyFile(path.join(projectRoot, item), path.join(output, item));
}
const sourceCharacters = path.join(projectRoot, "assets", "characters");
const outputCharacters = path.join(output, "assets", "characters");
await fs.mkdir(outputCharacters, { recursive: true });
for (const image of (await fs.readdir(sourceCharacters)).filter((name) => name.endsWith("-person.jpg"))) {
  await fs.copyFile(path.join(sourceCharacters, image), path.join(outputCharacters, image));
}
const sourceBrand = path.join(projectRoot, "assets", "brand");
const outputBrand = path.join(output, "assets", "brand");
await fs.mkdir(outputBrand, { recursive: true });
await fs.copyFile(path.join(sourceBrand, "store-qr.png"), path.join(outputBrand, "store-qr.png"));

console.log(`静态站点已生成：${output}`);
