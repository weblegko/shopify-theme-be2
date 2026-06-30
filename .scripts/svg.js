import fs from 'fs';
import path from 'path';
import svgSprite from 'svg-sprite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Корень проекта
const rootDir = path.resolve(__dirname, '..');

// Папка с исходными SVG
const inputDir = path.resolve(rootDir, 'src/icons/collection');
// Папка для сгенерированного спрайта (внутри src)
const outputDir = path.resolve(rootDir, 'src/icons/sprite');
// Папка snippets Shopify (куда копируем спрайт как .liquid)
const snippetsDir = path.resolve(rootDir, 'snippets');

const config = {
  mode: {
    symbol: {
      dest: '.',
      sprite: 'sprite.svg',
      example: true,
    },
  },
  shape: {
    id: {
      generator: '%s'
    }
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
    namespaceIDs: false,
  },
};

const spriter = new svgSprite(config);

// Добавляем все SVG
fs.readdirSync(inputDir).forEach((file) => {
  if (file.endsWith('.svg')) {
    const filepath = path.join(inputDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    spriter.add(filepath, null, content);
  }
});

// Функция для добавления атрибутов к корневому <svg>
function addSvgAttributes(svgContent) {
  return svgContent.replace(
    '<svg',
    '<svg aria-hidden="true" focusable="false" style="position: absolute; width: 0; height: 0; overflow: hidden;"'
  );
}

// Компиляция спрайта
spriter.compile((error, result) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  // Создаём папки, если их нет
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(snippetsDir, { recursive: true });

  // Получаем исходное содержимое спрайта
  let spriteContent = result.symbol.sprite.contents;
  
  // Преобразуем в строку, если это буфер
  if (Buffer.isBuffer(spriteContent)) {
    spriteContent = spriteContent.toString('utf-8');
  } else if (typeof spriteContent !== 'string') {
    spriteContent = String(spriteContent);
  }

  // Добавляем атрибуты к корневому SVG
  spriteContent = addSvgAttributes(spriteContent);

  // Сохраняем спрайт в src/icons/sprite (как .svg для разработки)
  const spritePath = path.join(outputDir, 'sprite.svg');
  fs.writeFileSync(spritePath, spriteContent);
  console.log(`SVG спрайт сохранён в ${spritePath}`);

  // Копируем спрайт в snippets с расширением .liquid (уже с атрибутами)
  const liquidSpritePath = path.join(snippetsDir, 'weblegko-sprite.liquid');
  fs.writeFileSync(liquidSpritePath, spriteContent);
  console.log(`SVG спрайт скопирован в ${liquidSpritePath} (как Liquid-сниппет, атрибуты добавлены)`);

  // Сохраняем example.html (для удобства, в нём атрибуты не меняем)
  if (result.symbol.example && result.symbol.example.contents) {
    fs.writeFileSync(
      path.join(outputDir, 'symbol.html'),
      result.symbol.example.contents
    );
    console.log(` Пример использования: ${path.join(outputDir, 'symbol.html')}`);
  }
});