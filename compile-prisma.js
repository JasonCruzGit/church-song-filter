// Script to compile Prisma TypeScript files to JavaScript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'default');
const clientTsPath = path.join(prismaClientPath, 'client.ts');

console.log('Compiling Prisma client TypeScript files to JavaScript (CommonJS)...');

if (fs.existsSync(clientTsPath)) {
  // Use esbuild to compile TypeScript to CommonJS JavaScript
  // Replace import.meta.url with proper CommonJS handling
  const clientJsPath = path.join(prismaClientPath, 'client.js');
  const command = `npx esbuild ${clientTsPath} --bundle --platform=node --format=cjs --outfile=${clientJsPath}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error compiling Prisma client:', error);
      return;
    }
    if (stderr) {
      console.error('Stderr:', stderr);
    }
    console.log('Prisma client compiled successfully to CommonJS!');
    console.log(stdout);
  });
} else {
  console.log('Prisma client TypeScript file not found.');
}

