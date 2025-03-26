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

// Create a temporary build directory without spaces
const rootDir = path.resolve(__dirname);
const tempBuildDir = path.join(rootDir, 'tempbuild');

// Create the temp build directory if it doesn't exist
if (fs.existsSync(tempBuildDir)) {
  console.log('Removing existing temp build directory...');
  fs.rmSync(tempBuildDir, { recursive: true, force: true });
}

console.log('Creating temp build directory...');
fs.mkdirSync(tempBuildDir, { recursive: true });

// Function to copy directory recursively, but skipping node_modules and .git
function copyProjectFiles(src, dest) {
  console.log(`Copying from ${src} to ${dest}`);
  
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip node_modules and .git directories
    if (entry.isDirectory() && (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist')) {
      return;
    }
    
    if (entry.isDirectory()) {
      copyProjectFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy project files to temp directory
console.log('Copying project files to temp directory...');
copyProjectFiles(projectDir, tempBuildDir);

// Copy environment file
console.log('Copying .env.production to .env.local...');
if (fs.existsSync(path.join(projectDir, '.env.production'))) {
  try {
    fs.copyFileSync(
      path.join(projectDir, '.env.production'),
      path.join(tempBuildDir, '.env.local')
    );
    console.log('Environment file copied successfully');
  } catch (error) {
    console.error('Error copying environment file:', error);
  }
}

// Change to the temp build directory
console.log(`Changing to temp build directory: ${tempBuildDir}`);
process.chdir(tempBuildDir);

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

// Copy the build output back to the expected location
console.log('Copying build output to root directory...');
const buildDir = path.join(tempBuildDir, 'dist');
const destDir = path.join(rootDir, 'dist');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist!`);
    return;
  }
  
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
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