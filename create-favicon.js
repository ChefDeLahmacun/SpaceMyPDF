const fs = require('fs');
const path = require('path');

// Copy the Logo.png to favicon.ico in the public directory
try {
  const sourceFile = path.join(__dirname, 'public', 'images', 'Logo.png');
  const destFile = path.join(__dirname, 'public', 'favicon.ico');
  
  fs.copyFileSync(sourceFile, destFile);
  console.log('Favicon created successfully!');
} catch (error) {
  console.error('Error creating favicon:', error);
} 