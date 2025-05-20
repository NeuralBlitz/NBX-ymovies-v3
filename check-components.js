import fs from 'fs';
import path from 'path';

// Get the project root directory
const rootDir = process.cwd();
console.log('Root directory:', rootDir);

// Path to the components directory
const componentsDir = path.join(rootDir, 'client', 'src', 'components', 'ui');
console.log('Components directory:', componentsDir);

// List of components to check
const componentsToCheck = [
  'theme-provider.tsx',
  'toaster.tsx',
  'tooltip.tsx'
];

console.log('Checking for UI components...');

// Check if each component exists
componentsToCheck.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${component} exists at ${componentPath}`);
  } else {
    console.log(`❌ ${component} does NOT exist at ${componentPath}`);
  }
});

console.log('Component check complete.');

// Check if the aliases are defined correctly
console.log('\nChecking import path in main.tsx...');
const mainPath = path.join(rootDir, 'client', 'src', 'main.tsx');

if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  console.log('main.tsx imports:');
  const importLines = mainContent.split('\n')
    .filter(line => line.startsWith('import '));
  
  importLines.forEach(line => {
    console.log(`  ${line}`);
  });
} else {
  console.log('❌ main.tsx does not exist');
}
