# API Test Framework v1.0.2 - Bearer Token Fix 🔐

**Kritischer Bugfix** - Behebt Authentifizierungs-Probleme mit Bearer Tokens.

## 🐛 Behobenes Problem

### Bearer Token Authentication funktioniert jetzt
**Symptom in v1.0.1**:
- ❌ API-Aufrufe ohne Auth: ✅ Funktioniert
- ❌ API-Aufrufe mit Bearer Token: ❌ 500 Internal Server Error

**Jetzt in v1.0.2**:
- ✅ API-Aufrufe ohne Auth: ✅ Funktioniert
- ✅ API-Aufrufe mit Bearer Token: ✅ Funktioniert
- ✅ API-Aufrufe mit API Key: ✅ Funktioniert

## 🔧 Technische Details

### Problem-Ursache
Der CORS-Proxy in v1.0.1 hat alle Headers mit dem Spread-Operator weitergeleitet:
```javascript
headers: {
  ...headers,  // Problematisch!
  'User-Agent': '...'
}
```

Dies führte zu Konflikten und ungültigen Headern bei manchen APIs.

### Lösung
Selektive Header-Weiterleitung - nur relevante Headers:
```javascript
headers: {
  'User-Agent': 'API-Test-Framework/1.0',
  'Content-Type': headers['Content-Type'],      // nur bei POST/PUT/PATCH
  'Authorization': headers['Authorization'],     // ✅ Bearer Token
  'X-API-Key': headers['X-API-Key'],            // ✅ API Keys
  // + alle custom x-* headers
}
```

## ✨ Verbesserungen

### Detailliertes Logging
Der Server zeigt nun alle Requests im Detail:

```
[2026-02-07T14:00:00.000Z] PROXY REQUEST: POST https://api.example.com/v1/data
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJ..."
}
Proxy Headers: {
  "User-Agent": "API-Test-Framework/1.0",
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJ..."
}
Request Body: {"field":"value"}
[2026-02-07T14:00:01.000Z] PROXY POST https://api.example.com/v1/data - 200
```

Bei Fehlern:
```
Error Response: {"error": "Unauthorized", "message": "Invalid token"}
```

### Bessere Fehlermeldungen
```json
{
  "error": "Connection refused",
  "details": "Proxy request failed - check server logs"
}
```

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.2.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.2.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`

### Upgrade von v1.0.0 oder v1.0.1

**Wichtig**: Nur `server.js` muss aktualisiert werden!

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie die Datei:
   - `server.js` ← **Dies ist die einzige Datei, die geändert wurde!**
3. **Starten** Sie den Server neu

Ihre `config/apis.json` und alle anderen Dateien bleiben unverändert.

## 🔄 Changelog

### v1.0.2 (2026-02-07)

**[FIXED]**
- ✅ Bearer Token Authentication funktioniert jetzt korrekt
- ✅ API Key Authentication funktioniert besser
- ✅ Header-Konflikte beim Proxy behoben

**[IMPROVED]**
- ✅ Detailliertes Request/Response Logging
- ✅ Bessere Fehlermeldungen mit Details
- ✅ Selektive Header-Weiterleitung statt Spread

**[CHANGED]**
- `server.js`: Header-Handling komplett überarbeitet

## 📊 Versions-Vergleich

| Version | CORS Fix | Bearer Token | Logging | Status |
|---------|----------|--------------|---------|--------|
| v1.0.0  | ❌ Nein  | ❌ N/A       | Basic   | Deprecated |
| v1.0.1  | ✅ Ja    | ❌ Broken    | Basic   | Deprecated |
| v1.0.2  | ✅ Ja    | ✅ Fixed     | ✅ Detail | **Recommended** |

## 🚀 Warum upgraden?

**Falls Sie v1.0.0 verwenden:**
- Kritisch: CORS-Probleme werden gelöst
- Kritisch: Bearer Token funktioniert

**Falls Sie v1.0.1 verwenden:**
- Kritisch: Bearer Token funktioniert jetzt
- Bonus: Besseres Logging für Debugging

## 🧪 Testing-Checklist

Nach dem Upgrade testen Sie:

- [ ] API ohne Auth → Sollte funktionieren
- [ ] API mit Bearer Token → **Sollte jetzt funktionieren!**
- [ ] API mit API Key → Sollte funktionieren
- [ ] Server-Logs → Sollten detaillierte Infos zeigen

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.2
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.2/api-tester-v1.0.2.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

---

**Empfehlung**: **Alle Benutzer sollten auf v1.0.2 upgraden**, besonders wenn Sie Bearer Token verwenden!

Built with ❤️ using React, esbuild & Node.js
