import fs from 'node:fs';
import path from 'node:path';

/**
 * Cross-platform payload assembler for Next.js Standalone Shared Hosting.
 * Assembles:
 *  - deploy/app/ (from .next/standalone)
 *  - deploy/app/.next/static/ (from .next/static)
 *  - deploy/app/public/ (from public)
 *  - deploy/app.cjs (from root app.cjs)
 *  - deploy/tmp/restart.txt (touching restart trigger)
 */

const rootDir = process.cwd();
const deployDir = path.join(rootDir, 'deploy');
const appDir = path.join(deployDir, 'app');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticDir = path.join(rootDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');
const appCjsSource = path.join(rootDir, 'app.cjs');

console.log('🚀 Assembling Next.js shared hosting deployment bundle...');

if (!fs.existsSync(standaloneDir)) {
  console.error('❌ Error: .next/standalone does not exist. Please run `next build` with `output: "standalone"` first.');
  process.exit(1);
}

// 1. Recreate clean deploy/ directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(appDir, { recursive: true });

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copy .next/standalone to deploy/app
console.log('📦 Copying standalone server & traced dependencies to deploy/app...');
copyDirSync(standaloneDir, appDir);

// 3. Copy .next/static to deploy/app/.next/static
if (fs.existsSync(staticDir)) {
  console.log('🎨 Copying static assets (.next/static)...');
  const targetStaticDir = path.join(appDir, '.next', 'static');
  copyDirSync(staticDir, targetStaticDir);
} else {
  console.warn('⚠️ Warning: .next/static was not found.');
}

// 4. Copy public folder to deploy/app/public
if (fs.existsSync(publicDir)) {
  console.log('📂 Copying public folder...');
  const targetPublicDir = path.join(appDir, 'public');
  copyDirSync(publicDir, targetPublicDir);
}

// 5. Copy app.cjs to deploy/app.cjs
if (fs.existsSync(appCjsSource)) {
  console.log('⚙️ Copying app.cjs startup shim to deploy/app.cjs...');
  fs.copyFileSync(appCjsSource, path.join(deployDir, 'app.cjs'));
} else {
  console.log('⚙️ app.cjs not found in root, generating default startup shim in deploy/app.cjs...');
  const defaultShim = `process.env.NODE_ENV = process.env.NODE_ENV || "production";\nprocess.env.HOSTNAME = "0.0.0.0";\nrequire("./app/server.js");\n`;
  fs.writeFileSync(path.join(deployDir, 'app.cjs'), defaultShim, 'utf8');
}

// 6. Create tmp/restart.txt
const tmpDir = path.join(deployDir, 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const restartPayload = `restart ${Date.now()}\n`;
fs.writeFileSync(path.join(tmpDir, 'restart.txt'), restartPayload, 'utf8');
console.log('🔄 Generated deploy/tmp/restart.txt to signal Passenger restart.');

console.log('✅ Assembly complete! The `deploy/` directory is ready to upload to your shared host application root.');
