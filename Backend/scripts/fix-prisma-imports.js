import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix both source and dist directories
const generatedDir = join(__dirname, '..', 'generated', 'prisma');
const distDir = join(__dirname, '..', 'dist', 'generated', 'prisma');

function fixImports(content) {
  // Pattern to match relative imports that need .js extension
  // Matches: from "./path", import "./path", or import * from "./path"
  // Create fresh regex objects each time to avoid state issues with 'g' flag
  const fromPattern = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  const importDirectPattern = /import\s+['"](\.\.?\/[^'"]+)['"]/g;
  
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

function getAllFiles(dir, extensions = ['.js', '.ts'], fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, extensions, fileList);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function processDirectory(dir, extensions) {
  // Check if directory exists
  try {
    statSync(dir);
  } catch (error) {
    console.log(`Directory ${dir} does not exist. Skipping.`);
    return 0;
  }

  // Find all files in the directory
  const files = getAllFiles(dir, extensions);

  console.log(`Found ${files.length} files to process in ${dir}`);

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
  
  return fixedCount;
}

function fixPrismaImports() {
  try {
    console.log('Fixing Prisma imports for ESM compatibility...');
    
    // Fix source generated files (.ts)
    const sourceFixed = processDirectory(generatedDir, ['.ts']);
    
    // Fix compiled generated files (.js) if they exist
    const distFixed = processDirectory(distDir, ['.js']);

    console.log(`Finished fixing Prisma imports (${sourceFixed + distFixed} files modified)`);
  } catch (error) {
    console.error('Error fixing Prisma imports:', error);
    process.exit(1);
  }
}

fixPrismaImports();

