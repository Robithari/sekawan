// scripts/scan-unused-ejs.js
// Scan all .ejs files under views/ and check for unused templates

const fs = require('fs');
const path = require('path');

function getAllEjsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllEjsFiles(filePath, fileList);
    } else if (file.endsWith('.ejs')) {
      fileList.push(path.relative(path.join(__dirname, '..', 'views'), filePath).replace(/\\/g, '/'));
    }
  });
  return fileList;
}

function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Find all res.render('...') usages in JS files
function findRenderedEjs(jsFiles) {
  const rendered = new Set();
  const renderRegex = /res\.render\(['"`]([\w\/-]+)['"`]/g;
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = renderRegex.exec(content)) !== null) {
      rendered.add(match[1] + '.ejs');
    }
  });
  return rendered;
}

const viewsDir = path.join(__dirname, '..', 'views');
const allEjs = getAllEjsFiles(viewsDir);
const allJs = getAllJsFiles(path.join(__dirname, '..'));
const renderedEjs = findRenderedEjs(allJs);

const unused = allEjs.filter(ejs => !renderedEjs.has(ejs.replace(/\\/g, '/')) && !renderedEjs.has(ejs.replace(/\\/g, '/').replace(/\.ejs$/, '')));

if (unused.length === 0) {
  console.log('All .ejs files are used in res.render().');
  process.exit(0);
}
console.log('Unused .ejs files (never rendered):');
unused.forEach(f => console.log('  -', f));
process.exit(1);
