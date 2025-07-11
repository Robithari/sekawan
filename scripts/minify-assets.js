// Minify all JS and CSS in public/ automatically using terser and clean-css
// Jalankan: node scripts/minify-assets.js

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const jsDir = path.join(__dirname, '../public/js');
const cssDir = path.join(__dirname, '../public/css');
const minDir = path.join(__dirname, '../public/min');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function minifyJSFiles(srcDir, outDir) {
  ensureDir(outDir);
  fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.js')) {
      const srcPath = path.join(srcDir, file);
      const outPath = path.join(outDir, file.replace(/\.js$/, '.min.js'));
      const code = fs.readFileSync(srcPath, 'utf8');
      minify(code).then(result => {
        fs.writeFileSync(outPath, result.code, 'utf8');
        console.log('Minified JS:', outPath);
      });
    }
  });
}

function minifyCSSFiles(srcDir, outDir) {
  ensureDir(outDir);
  fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.css')) {
      const srcPath = path.join(srcDir, file);
      const outPath = path.join(outDir, file.replace(/\.css$/, '.min.css'));
      const code = fs.readFileSync(srcPath, 'utf8');
      const output = new CleanCSS().minify(code);
      fs.writeFileSync(outPath, output.styles, 'utf8');
      console.log('Minified CSS:', outPath);
    }
  });
}

// Minify JS & CSS
enableMinify();
function enableMinify() {
  ensureDir(minDir);
  minifyJSFiles(jsDir, path.join(minDir, 'js'));
  minifyCSSFiles(cssDir, path.join(minDir, 'css'));
}

// Rekomendasi kompresi gambar (manual):
// Jalankan: npx imagemin public/img/* --out-dir=public/img-opt/ --plugin=imagemin-mozjpeg --plugin=imagemin-pngquant
// Atau gunakan TinyPNG/Compressor.io untuk kompresi massal tanpa kehilangan kualitas.
