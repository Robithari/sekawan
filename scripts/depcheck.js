// scripts/depcheck.js
// Script to check for unused dependencies using depcheck

const depcheck = require('depcheck');
const path = require('path');

const options = {
  ignoreBinPackage: false,
  skipMissing: false,
};

depcheck(path.resolve(__dirname, '..'), options, (unused) => {
  const unusedDeps = unused.dependencies || [];
  const unusedDevDeps = unused.devDependencies || [];

  if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
    console.log('No unused dependencies found.');
    process.exit(0);
  }

  if (unusedDeps.length > 0) {
    console.log('Unused dependencies:');
    unusedDeps.forEach(dep => console.log('  -', dep));
  }
  if (unusedDevDeps.length > 0) {
    console.log('Unused devDependencies:');
    unusedDevDeps.forEach(dep => console.log('  -', dep));
  }
  process.exit(1);
});
