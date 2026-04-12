const fs = require('fs');
const path = require('path');

const sourceStatic = path.join(__dirname, '.next', 'static');
const targetStatic = path.join(__dirname, '.next', 'standalone', '.next', 'static');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(sourceStatic)) {
  copyDirectory(sourceStatic, targetStatic);
  console.log('✓ Copied static assets to standalone build');
} else {
  console.log('✗ No static assets found to copy');
}