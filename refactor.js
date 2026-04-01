const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace context and hook imports to barrel
  content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@\/app\/context\/[^'"]+['"]/g, "import { $1 } from '@/context'");
  content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@\/app\/hooks\/[^'"]+['"]/g, "import { $1 } from '@/hooks'");

  // 2. Replace component default imports to named barrel imports
  // Matches: import ComponentName from '@/app/components/ComponentName'
  content = content.replace(/import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"]@\/app\/components\/\1['"]/g, "import { $1 } from '@/components'");

  // 3. Fallback for any other @/app/components to @/components (like CSS modules or specific deep files)
  content = content.replace(/@\/app\/components/g, "@/components");
  
  // 4. Fallback for rest app/lib to lib
  content = content.replace(/@\/app\/lib/g, "@/lib");
  content = content.replace(/@\/app\/context/g, "@/context");
  content = content.replace(/@\/app\/hooks/g, "@/hooks");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

['app', 'components', 'hooks', 'context', 'lib'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, processFile);
  }
});
