// Script to compile Prisma TypeScript files to JavaScript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'default');
const clientTsPath = path.join(prismaClientPath, 'client.ts');

console.log('Compiling Prisma client TypeScript files to JavaScript (CommonJS)...');

// Function to create @prisma/client index file
function createPrismaClientIndex() {
  console.log('Creating @prisma/client index file...');
  
  const prismaClientDir = path.join(__dirname, 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaClientDir)) {
    fs.mkdirSync(prismaClientDir, { recursive: true });
  }
  
  // Create node_modules/@prisma/client/index.js
  // This file simply re-exports from the compiled default client
  const prismaClientIndexPath = path.join(prismaClientDir, 'index.js');
  const prismaClientIndexContent = `// Prisma Client re-export
// Re-export everything from the compiled default client
module.exports = require('.prisma/client/default');
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
  // Transpile each TypeScript file separately to preserve Prisma's structure
  // This ensures all imports and __dirname work correctly
  const files = ['client.ts', 'index.ts', 'enums.ts', 'models.ts', 'commonInputTypes.ts'];
  
  console.log('Compiling Prisma client files (preserving structure)...');
  
  try {
    for (const file of files) {
      const tsPath = path.join(prismaClientPath, file);
      if (fs.existsSync(tsPath)) {
        const jsPath = path.join(prismaClientPath, file.replace('.ts', '.js'));
        // Transpile without bundling to preserve structure and imports
        const command = `npx esbuild ${tsPath} --platform=node --format=cjs --keep-names --outfile=${jsPath}`;
        execSync(command, { encoding: 'utf8', stdio: 'inherit' });
      }
    }
    
    // Also compile internal directory
    const internalPath = path.join(prismaClientPath, 'internal');
    if (fs.existsSync(internalPath)) {
      const internalFiles = fs.readdirSync(internalPath).filter(f => f.endsWith('.ts'));
      for (const file of internalFiles) {
        const tsPath = path.join(internalPath, file);
        const jsPath = path.join(internalPath, file.replace('.ts', '.js'));
        const command = `npx esbuild ${tsPath} --platform=node --format=cjs --keep-names --outfile=${jsPath}`;
        execSync(command, { encoding: 'utf8', stdio: 'inherit' });
      }
    }
    
    // Also compile models directory
    const modelsPath = path.join(prismaClientPath, 'models');
    if (fs.existsSync(modelsPath)) {
      const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.ts'));
      for (const file of modelFiles) {
        const tsPath = path.join(modelsPath, file);
        const jsPath = path.join(modelsPath, file.replace('.ts', '.js'));
        const command = `npx esbuild ${tsPath} --platform=node --format=cjs --keep-names --outfile=${jsPath}`;
        execSync(command, { encoding: 'utf8', stdio: 'inherit' });
      }
    }
    
    console.log('✓ Prisma client files compiled successfully!');
    
    // Create @prisma/client index file after successful compilation
    // Note: index.js in .prisma/client/default is already compiled from index.ts
    createPrismaClientIndex();
    
    console.log('✓ Prisma client setup complete!');
  } catch (error) {
    console.error('Error compiling Prisma client:', error);
    process.exit(1);
  }
} else {
  console.log('Prisma client TypeScript file not found.');
  createPrismaClientIndex();
}

