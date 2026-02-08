# API Test Framework v1.0.9 - CORS Proxy Fix 🔧

**Bugfix Release** - Verbesserte CORS-Handhabung für Demo-APIs

## 🐛 Bugfixes

- ✅ **Demo-APIs CORS Fix:** Deaktiviere CORS-Proxy für Demo-APIs (Validation Demo, Advanced Features Demo)
  - `corsProxy: false` für jsonplaceholder.typicode.com Endpoints
  - Verhindert CORS-Fehler bei öffentlichen Test-APIs
  - Direkter Zugriff ohne Proxy für bessere Performance

## 📊 Änderungen

**Dateien:**
- `config/apis.json` - corsProxy: false für Demo-APIs hinzugefügt
- `dist/bundle.js` - Neu gebaut mit aktuellen Änderungen

**Betroffene APIs:**
- Validation Demo API
- Advanced Features Demo

## 📦 Installation

### Neu-Installation

1. **Download:** `api-tester-v1.0.9.zip` oder `api-tester-v1.0.9.tar.gz`
2. **Entpacken:** Entpacken Sie das Archiv
3. **Starten:**
   - Windows: Doppelklick auf `start.bat`
   - Linux/Mac: `node server.js`
4. **Öffnen:** `http://localhost:8080` im Browser

### Upgrade von v1.0.8

**Einfaches Update:**

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie:
   - `config/apis.json`
   - `dist/bundle.js`
3. **Starten** Sie den Server neu

## 🔄 Changelog

### v1.0.9 (2026-02-08)

**[FIXED]** 🐛
- ✅ Demo-APIs: CORS-Proxy deaktiviert für direkten Zugriff
- ✅ Verhindert unnötige Proxy-Requests für öffentliche APIs

**[IMPROVED]** 🔧
- ✅ Bessere Performance für Demo-APIs
- ✅ Keine CORS-Fehler mehr bei Test-APIs

## 📋 Alle v1.0.8 Features bleiben erhalten

Alle Features aus v1.0.8 sind weiterhin verfügbar:
- ✅ Form Validation (min/max, pattern, custom errors)
- ✅ UX Features (helpText, exampleValue, date fields)
- ✅ Advanced Features (Sections, Conditional Fields)

## ⚙️ Voraussetzungen

- Node.js v16+
- Kein npm install erforderlich
- Moderne Browser

## 🔗 Links

- **Previous Release:** [v1.0.8](RELEASE_v1.0.8.md)
- **GitHub:** https://github.com/drabeka/api-tester

---

**Empfehlung**: **Upgrade auf v1.0.9** für bessere CORS-Handhabung!

Built with ❤️ using React, esbuild & Node.js
