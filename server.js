#!/usr/bin/env node

/**
 * Eigenständiger HTTP-Server für API Test Framework
 * Benötigt nur Node.js - keine npm install erforderlich
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// MIME-Types für verschiedene Dateitypen
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

// HTTP-Server erstellen
const server = http.createServer((req, res) => {
  // URL normalisieren
  let filePath = req.url === '/' ? '/index.html' : req.url;

  // Query-Parameter entfernen
  filePath = filePath.split('?')[0];

  // Pfad-Traversal verhindern
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

  // Vollständiger Dateipfad
  const fullPath = path.join(__dirname, filePath);

  // MIME-Type bestimmen
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Datei lesen und zurückgeben
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 - Datei nicht gefunden
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>404 - Nicht gefunden</title></head>
            <body>
              <h1>404 - Datei nicht gefunden</h1>
              <p>Die angeforderte Datei <code>${filePath}</code> wurde nicht gefunden.</p>
              <a href="/">Zurück zur Startseite</a>
            </body>
          </html>
        `);
        console.log(`[${new Date().toISOString()}] 404 - ${req.url}`);
      } else {
        // 500 - Serverfehler
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Interner Serverfehler');
        console.error(`[${new Date().toISOString()}] 500 - ${req.url}:`, err);
      }
    } else {
      // 200 - Erfolg
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
      console.log(`[${new Date().toISOString()}] 200 - ${req.url}`);
    }
  });
});

// Server starten
server.listen(PORT, HOST, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          🚀 API Test Framework Server                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`  Server läuft auf:`);
  console.log(`  • http://localhost:${PORT}`);
  console.log(`  • http://127.0.0.1:${PORT}`);
  console.log(`\n  Zum Beenden: Strg+C drücken\n`);
  console.log('════════════════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n✓ Server wird beendet...');
  server.close(() => {
    console.log('✓ Server gestoppt.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n✓ Server wird beendet...');
  server.close(() => {
    console.log('✓ Server gestoppt.');
    process.exit(0);
  });
});
