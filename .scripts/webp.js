import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка с исходниками (могут быть подпапки, но они игнорируются)
const inputDir = path.resolve(__dirname, '../src/images/source');
// Куда складываем готовые webp (плоская структура)
const outputWebp = path.resolve(__dirname, '../src/images/webp');
// Корень assets Shopify (плоский)
const assetsDir = path.resolve(__dirname, '../assets');

await fs.ensureDir(outputWebp);
await fs.ensureDir(assetsDir);

// Находим все изображения рекурсивно, но при сохранении будем брать только имя файла
const files = await glob(
  path.join(inputDir, "**/*.{jpg,jpeg,png,JPG,JPEG,PNG}").replace(/\\/g, "/")
);

if (!files.length) {
  console.log(chalk.red("Нет изображений в папке source"));
  process.exit();
}

// Словарь для отслеживания конфликтов имён
const nameMap = new Map();

for (const file of files) {
  const baseName = path.basename(file, path.extname(file));
  const webpPath = path.join(outputWebp, `${baseName}.webp`);
  
  if (nameMap.has(baseName)) {
    console.log(chalk.yellow(`⚠️ Конфликт имён: "${baseName}.webp" уже есть (${nameMap.get(baseName)} → ${file})`));
  }
  nameMap.set(baseName, file);
}

// Уникальные файлы по базовому имени (последний в map остаётся)
const uniqueFiles = Array.from(nameMap.entries()).map(([name, filePath]) => ({
  baseName: name,
  filePath,
  webpPath: path.join(outputWebp, `${name}.webp`)
}));

let convertedCount = 0;

for (const { filePath, baseName, webpPath } of uniqueFiles) {
  const webpExists = await fs.pathExists(webpPath);
  if (webpExists) continue;
  
  try {
    await sharp(filePath)
      .webp({ quality: 82, effort: 6 })
      .toFile(webpPath);
    console.log(chalk.green("WEBP "), `${baseName}.webp`);
    convertedCount++;
  } catch (e) {
    console.log(chalk.red("Ошибка конвертации:"), baseName, e.message);
  }
}

if (convertedCount === 0) {
  console.log(chalk.yellow("Новых webp не создано (все уже есть)"));
} else {
  console.log(chalk.cyan(`\nСоздано webp: ${convertedCount}`));
}

// --- КОПИРОВАНИЕ В ASSETS (плоско, без подпапок) ---
// console.log(chalk.cyan("\nСинхронизация с assets..."));

// const allWebp = await glob(path.join(outputWebp, "*.webp").replace(/\\/g, "/"));
// let copiedCount = 0;

// for (const webpFile of allWebp) {
//   const fileName = path.basename(webpFile);
//   const targetPath = path.join(assetsDir, fileName);
//   const exists = await fs.pathExists(targetPath);
//   if (!exists) {
//     await fs.copy(webpFile, targetPath);
//     console.log(chalk.green("COPY → "), fileName);
//     copiedCount++;
//   }
// }

// if (copiedCount === 0) {
//   console.log(chalk.yellow("Все webp уже есть в assets"));
// } else {
//   console.log(chalk.cyan(`\nСкопировано в assets: ${copiedCount}`));
// }

console.log(chalk.cyan("\nГотово!"));