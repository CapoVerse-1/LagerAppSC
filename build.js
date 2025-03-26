const { execSync } = require('child_process');
const path = require('path');

console.log("Starting build process...");

// Navigate to the correct directory
const projectPath = path.join('inventory-management - final', 'inventory-management - final');
process.chdir(projectPath);

// Run npm commands
console.log(`Changed directory to ${process.cwd()}`);
console.log("Installing dependencies...");
execSync('npm install', { stdio: 'inherit' });

console.log("Building the project...");
execSync('npm run build', { stdio: 'inherit' });

console.log("Build completed successfully!"); 