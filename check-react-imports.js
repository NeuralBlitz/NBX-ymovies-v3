// check-react-imports.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script checks TypeScript React files (.tsx) for potential React import issues:
 * 1. Files using JSX without importing React
 * 2. Files with mixed import styles (import React vs import * as React)
 * 3. Files with imports split across the file (not all at the top)
 */

// Configuration
const rootDir = path.join(__dirname, 'client/src');
const extensions = ['.tsx'];
const ignoreDirs = ['node_modules', 'dist', 'build', '.git'];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Counters
let totalFiles = 0;
let filesWithIssues = 0;
const issues = {
  noReactImport: [],
  mixedImportStyles: [],
  splitImports: [],
};

// Check if a file contains JSX
function containsJSX(content) {
  // Look for JSX patterns like <ComponentName or <div
  const jsxPattern = /<[A-Z][A-Za-z0-9]*|<[a-z]+[\s>]/;
  return jsxPattern.test(content);
}

// Check if a file imports React
function hasReactImport(content) {
  return /import\s+(\*\s+as\s+)?React\b/.test(content);
}

// Check if a file has mixed import styles
function hasMixedImportStyles(content) {
  const hasStarImport = /import\s+\*\s+as\s+React\b/.test(content);
  const hasDirectImport = /import\s+React\b/.test(content) && !/import\s+\*\s+as\s+React\b/.test(content);
  return hasStarImport && hasDirectImport;
}

// Check if imports are split across the file (not all at the top)
function hasSplitImports(content) {
  const lines = content.split('\n');
  let foundNonImport = false;
  let foundImportAfterNonImport = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('import ')) {
      if (foundNonImport) {
        foundImportAfterNonImport = true;
        break;
      }
    } else if (trimmedLine !== '' && 
               !trimmedLine.startsWith('//') && 
               !trimmedLine.startsWith('/*') &&
               !trimmedLine.startsWith('*')) {
      foundNonImport = true;
    }
  }
  
  return foundImportAfterNonImport;
}

// Process a file
function processFile(filePath) {
  try {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    const hasJSX = containsJSX(content);
    
    if (hasJSX && !hasReactImport(content)) {
      issues.noReactImport.push(filePath);
      filesWithIssues++;
      return;
    }
    
    if (hasReactImport(content) && hasMixedImportStyles(content)) {
      issues.mixedImportStyles.push(filePath);
      filesWithIssues++;
    }
    
    if (hasSplitImports(content)) {
      issues.splitImports.push(filePath);
      filesWithIssues++;
    }
  } catch (error) {
    console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error);
  }
}

// Recursively traverse directories
function traverseDirectory(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        traverseDirectory(fullPath);
      }
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

// Main execution
console.log(`${colors.cyan}Checking React imports in ${rootDir}...${colors.reset}`);
console.log('Script is running, this may take a moment...');
traverseDirectory(rootDir);
console.log('Finished checking files.');

// Report results
console.log(`\n${colors.blue}=== React Import Check Results ===${colors.reset}`);
console.log(`${colors.cyan}Total files checked: ${colors.reset}${totalFiles}`);

if (filesWithIssues === 0) {
  console.log(`${colors.green}No issues found! All files look good.${colors.reset}`);
} else {
  console.log(`${colors.yellow}Files with issues: ${filesWithIssues}${colors.reset}\n`);
  
  if (issues.noReactImport.length > 0) {
    console.log(`${colors.red}Missing React Import (${issues.noReactImport.length}):${colors.reset}`);
    issues.noReactImport.forEach(file => console.log(`  - ${file}`));
    console.log('');
  }
  
  if (issues.mixedImportStyles.length > 0) {
    console.log(`${colors.yellow}Mixed Import Styles (${issues.mixedImportStyles.length}):${colors.reset}`);
    issues.mixedImportStyles.forEach(file => console.log(`  - ${file}`));
    console.log('');
  }
  
  if (issues.splitImports.length > 0) {
    console.log(`${colors.magenta}Split Imports (${issues.splitImports.length}):${colors.reset}`);
    issues.splitImports.forEach(file => console.log(`  - ${file}`));
    console.log('');
  }
  
  // Print suggested fixes
  console.log(`${colors.cyan}Suggested fixes:${colors.reset}`);
  console.log(`1. Add ${colors.green}import React from 'react';${colors.reset} to files with missing imports`);
  console.log(`2. Standardize on one import style (either ${colors.green}import React${colors.reset} or ${colors.green}import * as React${colors.reset})`);
  console.log(`3. Move all imports to the top of the file, before any other code`);
}

// Exit with appropriate code
process.exit(filesWithIssues > 0 ? 1 : 0);
