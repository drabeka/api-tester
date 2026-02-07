# API Test Framework v1.0.4 - Content-Type Fix 📝

**Kritischer Bugfix** - Behebt "415 Unsupported Media Type" Fehler bei GET/DELETE-Requests.

## 🐛 Behobenes Problem

### 415 Unsupported Media Type Error
**Symptom in v1.0.3**:
- ❌ GET-Requests: ❌ "415 Unsupported Media Type"
- ❌ DELETE-Requests: ❌ "415 Unsupported Media Type"
- Problem: `Content-Type: application/json` wurde bei ALLEN Requests gesetzt, auch wenn kein Body vorhanden war

**Jetzt in v1.0.4**:
- ✅ GET-Requests: ✅ Funktioniert (kein Content-Type Header)
- ✅ DELETE-Requests: ✅ Funktioniert (kein Content-Type Header)
- ✅ POST/PUT/PATCH-Requests: ✅ Funktioniert (Content-Type: application/json)

## 🔧 Technische Details

### Problem-Ursache
Die API-Client-Library hat `Content-Type: application/json` bei **allen** Requests gesetzt:
```javascript
// ❌ FALSCH (v1.0.3)
const headers = {
  'Content-Type': 'application/json',  // Immer gesetzt!
};
```

Viele REST-APIs lehnen GET/DELETE-Requests mit Content-Type ab (HTTP 415), weil diese Methoden keinen Request-Body haben sollten.

### Lösung
Content-Type wird nur bei Requests mit Body gesetzt:
```javascript
// ✅ RICHTIG (v1.0.4)
const headers = {};

// Content-Type nur bei POST/PUT/PATCH
if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
  headers['Content-Type'] = 'application/json';
}
```

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.4.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.4.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`

### Upgrade von v1.0.0-v1.0.3

**Wichtig**: Nur `dist/bundle.js` muss aktualisiert werden!

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie die Datei:
   - `dist/bundle.js` ← **Dies ist die einzige Datei, die geändert wurde!**
3. **Starten** Sie den Server neu

Ihre `config/apis.json`, `server.js` und alle anderen Dateien bleiben unverändert.

## 🔄 Changelog

### v1.0.4 (2026-02-07)

**[FIXED]**
- ✅ "415 Unsupported Media Type" Error bei GET/DELETE behoben
- ✅ Content-Type Header wird nur bei POST/PUT/PATCH gesetzt
- ✅ REST-APIs funktionieren jetzt nach HTTP-Standard

**[CHANGED]**
- `src/utils/apiClient.js`: Content-Type nur bei Requests mit Body
- `dist/bundle.js`: Neuer Build mit Fix

## 📊 Versions-Vergleich

| Version | CORS | Bearer | SSL | Content-Type | Status |
|---------|------|--------|-----|--------------|--------|
| v1.0.0-v1.0.2 | ✅ | ✅ | ❌ | ❌ Immer | Deprecated |
| v1.0.3  | ✅ | ✅ | ✅ | ❌ Immer | Deprecated |
| **v1.0.4** | **✅** | **✅** | **✅** | **✅ Selektiv** | **Recommended** |

## 🚀 Warum upgraden?

**Falls Sie v1.0.0-v1.0.3 verwenden:**
- Kritisch: GET/DELETE-Requests funktionieren jetzt korrekt
- Viele REST-APIs lehnten vorher GET-Requests ab
- HTTP-Standard wird jetzt eingehalten

## 🧪 Testing-Checklist

Nach dem Upgrade testen Sie:

- [ ] GET-Request → **Sollte jetzt funktionieren!**
- [ ] POST-Request mit Body → Sollte funktionieren
- [ ] DELETE-Request → **Sollte jetzt funktionieren!**
- [ ] PUT/PATCH-Request mit Body → Sollte funktionieren
- [ ] Request mit Bearer Token → Sollte funktionieren

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.4
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.4/api-tester-v1.0.4.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

## 📝 HTTP-Standard Hinweis

Nach HTTP-Standard:
- **GET/HEAD/DELETE**: Kein Request-Body, daher kein Content-Type
- **POST/PUT/PATCH**: Request-Body möglich, Content-Type erforderlich

v1.0.4 hält sich jetzt an diesen Standard.

---

**Empfehlung**: **Alle Benutzer sollten auf v1.0.4 upgraden**, besonders wenn Sie GET/DELETE-Requests verwenden!

Built with ❤️ using React, esbuild & Node.js
