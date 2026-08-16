import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = globalThis;
await import(path.join(projectRoot, "data.js"));

const { questions, characters, dimensions } = globalThis.TEST_DATA;
const errors = [];

if (!fs.existsSync(path.join(projectRoot, "assets", "brand", "store-qr.png"))) {
  errors.push("缺少店铺二维码：assets/brand/store-qr.png");
}

if (questions.length !== 24) errors.push(`题目应为 24 道，当前 ${questions.length}`);
if (Object.keys(characters).length !== 12) errors.push(`角色应为 12 个，当前 ${Object.keys(characters).length}`);
if (Object.keys(dimensions).length !== 8) errors.push(`维度应为 8 个，当前 ${Object.keys(dimensions).length}`);

questions.forEach((question, index) => {
  if (question.options.length !== 4) errors.push(`第 ${index + 1} 题不是 4 个选项`);
  question.options.forEach((option, optionIndex) => {
    const invalid = Object.keys(option.weights).filter((key) => !(key in dimensions));
    if (invalid.length) errors.push(`第 ${index + 1} 题选项 ${optionIndex + 1} 有未知维度：${invalid.join(",")}`);
  });
});

Object.entries(characters).forEach(([id, character]) => {
  const missingProfile = Object.keys(dimensions).filter((key) => typeof character.profile[key] !== "number");
  if (missingProfile.length) errors.push(`${id} 缺少画像维度：${missingProfile.join(",")}`);
  const imagePath = path.join(projectRoot, character.image);
  if (!fs.existsSync(imagePath)) errors.push(`${id} 缺少人物图：${character.image}`);
  for (const key of ["public", "motive", "shadow", "relationship", "work", "growth"]) {
    if (!character.sections[key]) errors.push(`${id} 缺少结果段落：${key}`);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`检查通过：${questions.length} 道题 / ${Object.keys(characters).length} 个角色 / ${Object.keys(dimensions).length} 个维度`);
