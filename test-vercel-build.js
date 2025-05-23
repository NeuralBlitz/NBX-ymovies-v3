#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Testing Vercel Build Process...\n');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description} missing: ${filePath}`);
    return false;
  }
}

async function main() {
  try {
    console.log('1. Cleaning previous builds...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    
    console.log('\n2. Running Vercel build command...');
    await runCommand('npm', ['run', 'build:vercel']);
    
    console.log('\n3. Checking build outputs...');
    const checks = [
      checkFile('dist/public/index.html', 'Client HTML'),
      checkFile('dist/public/assets', 'Client assets'),
      checkFile('dist/index.js', 'Server bundle'),
      checkFile('api/index.js', 'Vercel API function'),
    ];
    
    const results = await Promise.all(checks);
    const allPass = results.every(result => result);
    
    if (allPass) {
      console.log('\n✅ Build test passed! Ready for Vercel deployment.');
      
      console.log('\n📋 Next steps:');
      console.log('1. Set environment variables in Vercel dashboard');
      console.log('2. Run: vercel --prod');
      console.log('3. Check deployment logs for any issues');
      
    } else {
      console.log('\n❌ Build test failed. Please fix the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
