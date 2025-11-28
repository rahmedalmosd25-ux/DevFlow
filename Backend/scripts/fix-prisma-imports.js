import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist', 'generated', 'prisma');

// Pattern to match relative imports that need .js extension
// Matches: from "./path", import "./path", or import * from "./path"
const fromPattern = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
const importDirectPattern = /import\s+['"](\.\.?\/[^'"]+)['"]/g;

function fixImports(content) {
  // Fix "from" imports (covers: import ... from "./path")
  content = content.replace(fromPattern, (match, importPath) => {
    // Skip if already has .js extension or is an external import
    if (importPath.endsWith('.js') || importPath.startsWith('@') || importPath.startsWith('node:')) {
      return match;
    }
    // Add .js extension
    return match.replace(importPath, `${importPath}.js`);
  });
  
  // Fix direct import statements (covers: import "./path")
  content = content.replace(importDirectPattern, (match, importPath) => {
    if (importPath.endsWith('.js') || importPath.startsWith('@') || importPath.startsWith('node:')) {
      return match;
    }
    return match.replace(importPath, `${importPath}.js`);
  });
  
  return content;
}

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixPrismaImports() {
  try {
    // Check if directory exists
    try {
      statSync(distDir);
    } catch (error) {
      console.log(`Directory ${distDir} does not exist. Skipping import fix.`);
      return;
    }

    // Find all .js files in the dist/generated/prisma directory
    const files = getAllFiles(distDir);

    console.log(`Found ${files.length} files to fix in ${distDir}`);

    let fixedCount = 0;
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const fixedContent = fixImports(content);
      
      if (content !== fixedContent) {
        writeFileSync(file, fixedContent, 'utf-8');
        fixedCount++;
        console.log(`Fixed imports in: ${file.replace(process.cwd(), '.')}`);
      }
    }

    console.log(`Finished fixing Prisma imports (${fixedCount} files modified)`);
  } catch (error) {
    console.error('Error fixing Prisma imports:', error);
    process.exit(1);
  }
}

fixPrismaImports();

