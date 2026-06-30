import fs from "fs-extra";
import path from "path";
import ttf2woff2 from "ttf2woff2";
import * as Font from "fonteditor-core"; 
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const fontsDir = path.join(rootDir, "src", "fonts");
const woffDir = path.join(rootDir, "assets");
const cssFile = path.join(rootDir, "src", "styles", "fonts.css");

const italicRegex = /italic/i;

const fontFaceTemplate = (name, file, weight, style) => `@font-face {
  font-family: "${name}";  
  src: url('${file}.woff2') format('woff2');
  font-display: swap;
  font-weight: ${weight};
  font-style: ${style};
}

`;

async function convertOtfToTtf(otfPath) {
  const buffer = await fs.readFile(otfPath);
  const font = Font.Font.create(buffer, { type: "otf", hinting: true });
  const ttfBuffer = Buffer.from(font.write({ type: "ttf", hinting: true }));
  const ttfPath = otfPath.replace(/\.otf$/i, ".ttf");
  await fs.writeFile(ttfPath, ttfBuffer);
  await fs.remove(otfPath);
  console.log(`Удалён исходный OTF: ${path.basename(otfPath)}`);
  return ttfPath;
}

async function convertTtfToWoff2(ttfPath) {
  const buffer = await fs.readFile(ttfPath);
  const woff2Buffer = ttf2woff2(buffer);
  const fileName = path.basename(ttfPath, ".ttf");
  const woff2Path = path.join(woffDir, `${fileName}.woff2`);
  // Если WOFF2 уже существует – не перезаписываем (опционально можно перезаписывать, но по условию не нужно)
  if (await fs.pathExists(woff2Path)) {
    console.log(`Уже существует: ${fileName}.woff2, пропускаем конвертацию`);
    return fileName;
  }
  await fs.writeFile(woff2Path, woff2Buffer);
  console.log(`✔ Создан : ${fileName}.woff2`);
  // TTF не удаляем — остаётся в src/fonts
  return fileName;
}

function parseFontFileName(fileName) {
  let name = fileName.split("-")[0].replace(/[_\s]+/g, "");
  let weight = 400;
  let style = italicRegex.test(fileName.toLowerCase()) ? "italic" : "normal";

  if (/-ultrablack/i.test(fileName)) weight = 950;
  else if (/-extrablack/i.test(fileName)) weight = 950;
  else if (/-black/i.test(fileName)) weight = 900;
  else if (/-heavy/i.test(fileName)) weight = 900;
  else if (/-bold/i.test(fileName)) weight = 700;
  else if (/-semibold/i.test(fileName)) weight = 600;
  else if (/-demibold/i.test(fileName)) weight = 600;
  else if (/-medium/i.test(fileName)) weight = 500;
  else if (/-regular/i.test(fileName)) weight = 400;
  else if (/-light/i.test(fileName)) weight = 300;
  else if (/-thin/i.test(fileName)) weight = 100;
  else if (/-hairline/i.test(fileName)) weight = 100;
  else if (/-extralight/i.test(fileName)) weight = 200;
  else if (/-ultralight/i.test(fileName)) weight = 200;

  return { name, weight, style };
}

async function run() {
  console.log("Обработка шрифтов...");

  await fs.ensureDir(woffDir);
  const sourceFiles = (await fs.readdir(fontsDir)).filter(f => /\.(otf|ttf)$/i.test(f));
  
  // Множество для отслеживания уже добавленных в CSS шрифтов (по имени файла без расширения)
  const processedFonts = new Set();

  // Сначала обрабатываем исходные TTF/OTF и создаём недостающие WOFF2
  for (const file of sourceFiles) {
    let filePath = path.join(fontsDir, file);

    if (/\.otf$/i.test(file)) {
      try {
        filePath = await convertOtfToTtf(filePath);
        console.log(`✔ ${file} → TTF (OTF удалён)`);
      } catch (err) {
        console.log(`Ошибка конвертации ${file}:`, err.message);
        continue;
      }
    }

    // Теперь filePath указывает на TTF (либо исходный, либо сконвертированный)
    let fileName;
    try {
      fileName = await convertTtfToWoff2(filePath);
    } catch (err) {
      console.log(`Ошибка конвертации ${file} → WOFF2:`, err.message);
      continue;
    }

    // Добавим в processedFonts для последующего исключения дублей при сканировании assets
    processedFonts.add(fileName);
  }

  // Теперь сканируем папку assets на наличие ВСЕХ WOFF2 (включая те, что могли появиться вручную)
  const allWoff2Files = (await fs.readdir(woffDir)).filter(f => f.endsWith('.woff2'));
  
  // Очищаем CSS файл перед записью
  await fs.writeFile(cssFile, "");
  
  for (const woff2 of allWoff2Files) {
    const baseName = path.basename(woff2, '.woff2');
    // Если этот шрифт уже был добавлен из исходников – пропускаем, чтобы не дублировать
    if (processedFonts.has(baseName)) continue;
    
    const { name, weight, style } = parseFontFileName(baseName);
    await fs.appendFile(cssFile, fontFaceTemplate(name, baseName, weight, style));
    processedFonts.add(baseName);
    console.log(`Добавлен в CSS (из существующего WOFF2): ${baseName}`);
  }
  
  // Дополнительно: для шрифтов, которые были обработаны из исходников, но их WOFF2 реально существует,
  // их записи ещё не добавлены – добавляем теперь
  // (поскольку мы очистили CSS, а в первом цикле ничего не писали)
  // Проще: после того как мы собрали processedFonts (все уникальные имена), пробегаем по ним и пишем CSS.
  // Но сейчас processedFonts содержит имена из исходников (которые мы не записали) плюс имена из assets.
  // Сделаем так: после того как собрали все имена (processedFonts), генерируем CSS заново.
  // Для этого пересоберём processedFonts сначала из всех WOFF2, которые есть в assets.
  // Так будет надёжнее.
  
  // Перестраиваем CSS на основе ТОЛЬКО реально существующих WOFF2 в assets
  const finalWoff2Files = await fs.readdir(woffDir);
  const woff2Names = finalWoff2Files.filter(f => f.endsWith('.woff2')).map(f => path.basename(f, '.woff2'));
  
  await fs.writeFile(cssFile, "");
  for (const baseName of woff2Names) {
    const { name, weight, style } = parseFontFileName(baseName);
    await fs.appendFile(cssFile, fontFaceTemplate(name, baseName, weight, style));
  }
  
  console.log(`fonts.css обновлён (включены все WOFF2 из assets, всего ${woff2Names.length} шт.)`);
  console.log("Готово! TTF-файлы сохранены в src/fonts, WOFF2 — в assets.");
}

run();