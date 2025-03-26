const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build script...');

// Get the project root directory - using path.resolve to handle spaces properly
const projectDir = path.resolve(__dirname, 'inventory-management - final', 'inventory-management - final');
console.log('Project directory path:', projectDir);

// Check if the directory exists
if (!fs.existsSync(projectDir)) {
  console.error(`Error: Directory ${projectDir} does not exist!`);
  // List directories to debug
  console.log('Contents of current directory:', fs.readdirSync(__dirname));
  if (fs.existsSync(path.resolve(__dirname, 'inventory-management - final'))) {
    console.log('Contents of first level directory:', 
      fs.readdirSync(path.resolve(__dirname, 'inventory-management - final')));
  }
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