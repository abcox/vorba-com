const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'vorba-web', 'browser', 'assets');

console.log('Renaming .mjs files to .js files...');

function renameMjsFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      renameMjsFiles(filePath);
    } else if (file.endsWith('.mjs')) {
      const newFileName = file.replace('.mjs', '.js');
      const newFilePath = path.join(dir, newFileName);
      
      try {
        fs.renameSync(filePath, newFilePath);
        console.log(`Renamed: ${file} -> ${newFileName}`);
      } catch (error) {
        console.error(`Error renaming ${file}:`, error.message);
      }
    }
  });
}

try {
  renameMjsFiles(distPath);
  console.log('Successfully renamed .mjs files to .js files');
} catch (error) {
  console.error('Error during file renaming:', error.message);
  process.exit(1);
} 