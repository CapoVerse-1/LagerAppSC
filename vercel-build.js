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

// Copy .env.production to .env.local to ensure environment variables are available
console.log('Copying .env.production to .env.local...');
if (fs.existsSync(path.join(projectDir, '.env.production'))) {
  try {
    fs.copyFileSync(
      path.join(projectDir, '.env.production'),
      path.join(projectDir, '.env.local')
    );
    console.log('Environment file copied successfully');
  } catch (error) {
    console.error('Error copying environment file:', error);
  }
}

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

// Copy the build output to the root directory for Vercel to find it
console.log('Copying build output to root directory...');
const rootDir = path.resolve(__dirname);
const buildDir = path.join(projectDir, '.next');
const destDir = path.join(rootDir, '.next');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  copyDirRecursive(buildDir, destDir);
  console.log('Build output copied successfully');
} catch (error) {
  console.error('Error copying build output:', error);
  process.exit(1);
}

console.log('Build completed successfully!'); 