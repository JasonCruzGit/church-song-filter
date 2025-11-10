// Postinstall script to create index.js for Prisma client
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'default');
const indexJsPath = path.join(prismaClientPath, 'index.js');
const clientJsPath = path.join(prismaClientPath, 'client.js');

// Always ensure index.js exists if client.js exists
if (fs.existsSync(clientJsPath)) {
  if (!fs.existsSync(indexJsPath)) {
    fs.writeFileSync(indexJsPath, "module.exports = require('./client.js');\n");
    console.log('✅ Created Prisma client index.js');
  }
}

