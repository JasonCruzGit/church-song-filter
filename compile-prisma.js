// Script to compile Prisma TypeScript files to JavaScript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
    
    // Create index files after successful compilation
    createIndexFiles();
  });
} else {
  console.log('Prisma client TypeScript file not found.');
}

