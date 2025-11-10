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
  
  // Ensure directories exist
  if (!fs.existsSync(prismaClientPath)) {
    fs.mkdirSync(prismaClientPath, { recursive: true });
  }
  
  const prismaClientDir = path.join(__dirname, 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaClientDir)) {
    fs.mkdirSync(prismaClientDir, { recursive: true });
  }
  
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
    throw error;
  }
  
  // Create node_modules/@prisma/client/index.js
  const prismaClientIndexPath = path.join(prismaClientDir, 'index.js');
  const prismaClientIndexContent = `// Prisma Client re-export
const prismaClient = require('.prisma/client/default');
module.exports = prismaClient;
`;
  
  try {
    fs.writeFileSync(prismaClientIndexPath, prismaClientIndexContent);
    console.log('✓ Created @prisma/client/index.js');
  } catch (error) {
    console.error('Error creating @prisma/client index.js:', error);
    throw error;
  }
}

if (fs.existsSync(clientTsPath)) {
  // Use esbuild to compile TypeScript to CommonJS JavaScript
  // Use --keep-names to preserve function names for Prisma's internal checks
  const clientJsPath = path.join(prismaClientPath, 'client.js');
  const command = `npx esbuild ${clientTsPath} --bundle --platform=node --format=cjs --keep-names --outfile=${clientJsPath}`;
  
  try {
    console.log('Compiling Prisma client...');
    const stdout = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log('Prisma client compiled successfully to CommonJS!');
    
    // Create index files after successful compilation
    createIndexFiles();
    
    // Verify PrismaClient can be imported
    console.log('Verifying Prisma client can be imported...');
    try {
      // Clear require cache to ensure fresh import
      const prismaClientIndexPath = path.join(__dirname, 'node_modules', '@prisma', 'client', 'index.js');
      if (require.cache[prismaClientIndexPath]) {
        delete require.cache[prismaClientIndexPath];
      }
      const defaultIndexPath = path.join(prismaClientPath, 'index.js');
      if (require.cache[defaultIndexPath]) {
        delete require.cache[defaultIndexPath];
      }
      if (require.cache[clientJsPath]) {
        delete require.cache[clientJsPath];
      }
      
      // Try to import PrismaClient
      const { PrismaClient } = require('@prisma/client');
      if (PrismaClient) {
        console.log('✓ PrismaClient verified and ready!');
      } else {
        throw new Error('PrismaClient not found in exports');
      }
    } catch (verifyError) {
      console.error('Warning: Could not verify PrismaClient import:', verifyError.message);
      // Don't fail the build, but log the warning
    }
  } catch (error) {
    console.error('Error compiling Prisma client:', error);
    process.exit(1);
  }
} else {
  console.log('Prisma client TypeScript file not found.');
  // Still create index files even if client.ts doesn't exist (might be using pre-compiled version)
  createIndexFiles();
}

