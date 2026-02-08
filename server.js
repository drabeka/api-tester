#!/usr/bin/env node

/**
 * Eigenständiger HTTP-Server für API Test Framework
 * Benötigt nur Node.js - keine npm install erforderlich
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

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

/**
 * CORS-Proxy-Handler für API-Requests
 * Leitet Requests an externe APIs weiter und fügt CORS-Header hinzu
 */
function handleProxyRequest(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const requestData = JSON.parse(body);
      const targetUrl = requestData.url;
      const method = requestData.method || 'POST';
      const headers = requestData.headers || {};
      const payload = requestData.body;

      console.log(`[${new Date().toISOString()}] PROXY REQUEST: ${method} ${targetUrl}`);
      console.log('Headers:', JSON.stringify(headers, null, 2));

      if (!targetUrl) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'URL ist erforderlich' }));
        return;
      }

      const urlObj = new URL(targetUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      // Headers vorbereiten - nur relevante Headers weitergeben
      const proxyHeaders = {
        'User-Agent': 'API-Test-Framework/1.0',
        'Accept': headers['Accept'] || '*/*'
      };

      // Content-Type nur bei POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && headers['Content-Type']) {
        proxyHeaders['Content-Type'] = headers['Content-Type'];
      }

      // Auth-Header weitergeben
      if (headers['Authorization']) {
        proxyHeaders['Authorization'] = headers['Authorization'];
      }

      // API-Key Header weitergeben
      if (headers['X-API-Key']) {
        proxyHeaders['X-API-Key'] = headers['X-API-Key'];
      }

      // Custom Header weitergeben (für andere API-Key Formate)
      Object.keys(headers).forEach(key => {
        if (key.toLowerCase().startsWith('x-') && !proxyHeaders[key]) {
          proxyHeaders[key] = headers[key];
        }
      });

      console.log('Proxy Headers:', JSON.stringify(proxyHeaders, null, 2));

      const proxyReq = protocol.request(targetUrl, {
        method: method,
        headers: proxyHeaders,
        rejectUnauthorized: false // SSL-Zertifikate nicht streng prüfen (für Test-APIs)
      }, (proxyRes) => {
        let responseBody = '';

        proxyRes.on('data', chunk => {
          responseBody += chunk;
        });

        proxyRes.on('end', () => {
          // CORS-Header hinzufügen
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': proxyRes.headers['content-type'] || 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
          });
          res.end(responseBody);

          console.log(`[${new Date().toISOString()}] PROXY ${method} ${targetUrl} - ${proxyRes.statusCode}`);
          if (proxyRes.statusCode >= 400) {
            console.log('Error Response:', responseBody.substring(0, 500));
          }
        });
      });

      proxyReq.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] PROXY ERROR:`, err.message);
        console.error('Full error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: err.message,
          details: 'Proxy request failed - check server logs'
        }));
      });

      // Body nur schreiben wenn Payload nicht leer ist
      const hasPayload = payload &&
        (typeof payload === 'string' ? payload.length > 0 : Object.keys(payload).length > 0);

      if (hasPayload && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        const bodyData = typeof payload === 'string' ? payload : JSON.stringify(payload);
        proxyReq.write(bodyData);
        console.log('Request Body:', bodyData.substring(0, 200));
      } else if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        console.log('Request Body: (empty)');
      }

      proxyReq.end();

    } catch (err) {
      console.error(`[${new Date().toISOString()}] PROXY PARSE ERROR:`, err.message);
      console.error('Stack:', err.stack);
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Ungültige Request-Daten',
        details: err.message
      }));
    }
  });
}

// HTTP-Server erstellen
const server = http.createServer((req, res) => {
  // CORS-Header für alle Anfragen setzen
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
  };

  // OPTIONS-Request (CORS Preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // CORS-Proxy-Endpunkt
  if (req.url === '/api/proxy' && req.method === 'POST') {
    handleProxyRequest(req, res);
    return;
  }

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
        res.writeHead(404, { 'Content-Type': 'text/html', ...corsHeaders });
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
        res.writeHead(500, { 'Content-Type': 'text/plain', ...corsHeaders });
        res.end('500 - Interner Serverfehler');
        console.error(`[${new Date().toISOString()}] 500 - ${req.url}:`, err);
      }
    } else {
      // 200 - Erfolg
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        ...corsHeaders
      });
      res.end(data);
      console.log(`[${new Date().toISOString()}] 200 - ${req.url}`);
    }
  });
});

// Server starten
server.listen(PORT, HOST, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          🚀 API Test Framework Server                      ║');
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
