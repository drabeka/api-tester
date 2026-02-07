# API Test Framework v1.0.3 - SSL Certificate Fix 🔒

**Kritischer Bugfix** - Behebt SSL-Zertifikat-Probleme bei HTTPS-APIs.

## 🐛 Behobenes Problem

### SSL Certificate Verification Error
**Symptom in v1.0.2**:
- ❌ HTTPS-APIs mit selbst-signierten Zertifikaten: ❌ "unable to get local issuer certificate"
- ❌ Test-APIs mit ungültigen SSL-Zertifikaten: ❌ Proxy request failed

**Jetzt in v1.0.3**:
- ✅ HTTP-APIs: ✅ Funktioniert
- ✅ HTTPS-APIs mit gültigen Zertifikaten: ✅ Funktioniert
- ✅ HTTPS-APIs mit selbst-signierten Zertifikaten: ✅ Funktioniert
- ✅ Test-APIs: ✅ Funktioniert

## 🔧 Technische Details

### Problem-Ursache
Der CORS-Proxy in v1.0.2 hat SSL-Zertifikate streng geprüft. Bei selbst-signierten oder ungültigen Zertifikaten (häufig bei Test-/Development-APIs) kam der Fehler:
```
error: unable to get local issuer certificate
details: proxy request failed - check server logs
```

### Lösung
SSL-Zertifikat-Prüfung für den Proxy deaktiviert:
```javascript
const proxyReq = protocol.request(targetUrl, {
  method: method,
  headers: proxyHeaders,
  rejectUnauthorized: false // ✅ SSL-Zertifikate nicht streng prüfen
}, (proxyRes) => {
```

⚠️ **Hinweis**: Dies ist für Test-/Development-Zwecke gedacht. In Produktion sollten gültige SSL-Zertifikate verwendet werden.

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.3.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.3.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`

### Upgrade von v1.0.0, v1.0.1 oder v1.0.2

**Wichtig**: Nur `server.js` muss aktualisiert werden!

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie die Datei:
   - `server.js` ← **Dies ist die einzige Datei, die geändert wurde!**
3. **Starten** Sie den Server neu

Ihre `config/apis.json` und alle anderen Dateien bleiben unverändert.

## 🔄 Changelog

### v1.0.3 (2026-02-07)

**[FIXED]**
- ✅ SSL Certificate Verification Error behoben
- ✅ Proxy funktioniert jetzt mit selbst-signierten Zertifikaten
- ✅ Test-APIs mit ungültigen SSL-Zertifikaten funktionieren

**[CHANGED]**
- `server.js`: SSL-Zertifikat-Prüfung deaktiviert (`rejectUnauthorized: false`)

## 📊 Versions-Vergleich

| Version | CORS | Bearer Token | SSL Certs | Logging | Status |
|---------|------|--------------|-----------|---------|--------|
| v1.0.0  | ❌   | ❌ N/A       | ❌ Strict | Basic   | Deprecated |
| v1.0.1  | ✅   | ❌ Broken    | ❌ Strict | Basic   | Deprecated |
| v1.0.2  | ✅   | ✅ Fixed     | ❌ Strict | ✅ Detail | Deprecated |
| v1.0.3  | ✅   | ✅ Fixed     | ✅ Relaxed | ✅ Detail | **Recommended** |

## 🚀 Warum upgraden?

**Falls Sie v1.0.0, v1.0.1 oder v1.0.2 verwenden:**
- Kritisch: SSL-Zertifikat-Fehler werden behoben
- Test-APIs funktionieren jetzt auch mit selbst-signierten Zertifikaten
- Alle vorherigen Fixes (CORS, Bearer Token) sind enthalten

## 🧪 Testing-Checklist

Nach dem Upgrade testen Sie:

- [ ] HTTP-API → Sollte funktionieren
- [ ] HTTPS-API mit gültigem Zertifikat → Sollte funktionieren
- [ ] HTTPS-API mit selbst-signiertem Zertifikat → **Sollte jetzt funktionieren!**
- [ ] API mit Bearer Token → Sollte funktionieren
- [ ] API mit API Key → Sollte funktionieren

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.3
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.3/api-tester-v1.0.3.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

---

**Empfehlung**: **Alle Benutzer sollten auf v1.0.3 upgraden**, besonders wenn Sie Test-APIs oder selbst-signierte Zertifikate verwenden!

Built with ❤️ using React, esbuild & Node.js
