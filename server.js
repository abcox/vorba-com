console.log('--- server.js starting up ---'); // First line

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('📦 Starting server.js');

const app = express();
const PORT = process.env.PORT || 8080;

console.log(`🌐 Process PORT: ${process.env.PORT}`);
console.log(`📦 Effective PORT: ${PORT}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`📁 __dirname: ${__dirname}`);

const DIST_FOLDER = path.join(__dirname);

console.log(`📁 DIST_FOLDER: ${DIST_FOLDER}`);

app.use(express.static(DIST_FOLDER, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use((req, res) => {
  console.log(`📨 Received request: ${req.url}`);
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Angular app running on http://localhost:${PORT}`);
});