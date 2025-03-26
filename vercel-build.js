const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build script...');

// Get the project root directory - the directory with nested Next.js app
const projectDir = path.join(__dirname, 'inventory-management - final', 'inventory-management - final');

// Check if the directory exists
if (!fs.existsSync(projectDir)) {
  console.error(`Error: Directory ${projectDir} does not exist!`);
  process.exit(1);
}

// Change to the project directory
console.log(`Changing to directory: ${projectDir}`);
process.chdir(projectDir);

// Install dependencies
console.log('Installing dependencies...');
const npmInstall = spawnSync('npm', ['install'], { stdio: 'inherit' });
if (npmInstall.status !== 0) {
  console.error('Failed to install dependencies');
  process.exit(1);
}

// Run the build
console.log('Building the application...');
const npmBuild = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (npmBuild.status !== 0) {
  console.error('Build failed');
  process.exit(1);
}

console.log('Build completed successfully!'); 