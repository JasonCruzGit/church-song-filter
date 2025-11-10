// Script to compile Prisma TypeScript files to JavaScript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'default');
const clientTsPath = path.join(prismaClientPath, 'client.ts');

console.log('Compiling Prisma client TypeScript files to JavaScript (CommonJS)...');

// Function to create index files
function createIndexFiles() {
  console.log('Creating Prisma client index files...');
  
  // Create node_modules/.prisma/client/default/index.js
  const defaultIndexPath = path.join(prismaClientPath, 'index.js');
  const defaultIndexContent = `// Prisma client index - use compiled CommonJS file
// The client.js is compiled from client.ts using esbuild
module.exports = require('./client.js');
`;
  
  try {
    fs.writeFileSync(defaultIndexPath, defaultIndexContent);
    console.log('✓ Created .prisma/client/default/index.js');
  } catch (error) {
    console.error('Error creating default index.js:', error);
  }
  
  // Create node_modules/@prisma/client/index.js
  const prismaClientIndexPath = path.join(__dirname, 'node_modules', '@prisma', 'client', 'index.js');
  const prismaClientIndexContent = `// Prisma Client re-export
module.exports = {
  ...require('.prisma/client/default'),
}
`;
  
  try {
    fs.writeFileSync(prismaClientIndexPath, prismaClientIndexContent);
    console.log('✓ Created @prisma/client/index.js');
  } catch (error) {
    console.error('Error creating @prisma/client index.js:', error);
  }
}

if (fs.existsSync(clientTsPath)) {
  // Use esbuild to compile TypeScript to CommonJS JavaScript
  const clientJsPath = path.join(prismaClientPath, 'client.js');
  const command = `npx esbuild ${clientTsPath} --bundle --platform=node --format=cjs --outfile=${clientJsPath}`;
  
  try {
    console.log('Compiling Prisma client...');
    const stdout = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log('Prisma client compiled successfully to CommonJS!');
    
    // Create index files after successful compilation
    createIndexFiles();
  } catch (error) {
    console.error('Error compiling Prisma client:', error);
    process.exit(1);
  }
} else {
  console.log('Prisma client TypeScript file not found.');
  // Still create index files even if client.ts doesn't exist (might be using pre-compiled version)
  createIndexFiles();
}

