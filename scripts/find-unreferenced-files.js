// scripts/find-unreferenced-files.js
// Script to find files that are not referenced anywhere in the project
// Usage: node scripts/find-unreferenced-files.js > unreferenced-files.txt

const fs = require('fs');
const path = require('path');

// List of candidate files (from unimported output, edit as needed)
const candidates = [
  'config/appConfig.js',
  'config/cloudinary.js',
  'config/database.js',
  'config/firebase-config.js',
  'middleware/csrfProtection.js',
  'middleware/logger.js',
  'models/articleModel.js',
  'models/beritaModel.js',
  'my-invoice-app/src/app.js',
  'my-invoice-app/src/controllers/invoiceController.js',
  'my-invoice-app/src/routes/invoiceRoutes.js',
  'patches/cek-auth-loading-fix.js',
  // ...tambahkan semua file kandidat dari output unimported di sini...
];

// Directories to search for references
const searchDirs = ['.'];

function searchReference(file) {
  const fileName = path.basename(file);
  const results = [];
  searchDirs.forEach(dir => {
    const grep = require('child_process').spawnSync(
      process.platform === 'win32' ? 'findstr' : 'grep',
      process.platform === 'win32'
        ? ['/s', '/i', fileName, dir + '\*.*']
        : ['-ri', fileName, dir],
      { encoding: 'utf8' }
    );
    if (grep.stdout && grep.stdout.trim()) {
      results.push(grep.stdout.trim());
    }
  });
  return results.length > 0;
}

const unreferenced = [];
candidates.forEach(file => {
  if (!fs.existsSync(file)) return;
  if (!searchReference(file)) {
    unreferenced.push(file);
  }
});

if (unreferenced.length === 0) {
  console.log('No unreferenced files found.');
} else {
  console.log('Unreferenced files:');
  unreferenced.forEach(f => console.log('  -', f));
}
