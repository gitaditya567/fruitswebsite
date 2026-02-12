import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');
const notFoundFile = path.join(distDir, '404.html');

if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, notFoundFile);
    console.log('Copied index.html to 404.html for fallback routing');
} else {
    console.log('index.html not found in dist directory');
}
