# API Test Framework v1.0.1 - CORS Fix 🔧

**Wichtiges Bugfix-Release** - Behebt CORS-Probleme beim Testen externer APIs.

## 🐛 Behobene Probleme

### CORS-Fehler komplett gelöst
Vorher erhielten Benutzer beim Testen externer APIs häufig diese Fehlermeldung:
```
Access to fetch at '...' has been blocked by CORS policy
```

**Jetzt funktioniert es einwandfrei!** ✅

## ✨ Neue Features

### Integrierter CORS-Proxy
- **Automatisch aktiviert** - keine Konfiguration nötig
- **Funktioniert mit allen APIs** - egal welcher Host
- **Unterstützt Auth** - Bearer Token, API Keys bleiben funktional
- **Transparent** - Sie merken nichts davon, es funktioniert einfach

### Technische Details
- Neuer `/api/proxy` Endpunkt im Server
- Leitet Requests an externe APIs weiter
- Fügt automatisch CORS-Header hinzu
- OPTIONS Preflight-Requests werden korrekt behandelt

## 📦 Installation

### Download & Start (Windows)

1. **Download**: `api-tester-v1.0.1.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.1.tar.gz`
3. **Starten**: Doppelklick auf `start.bat`
4. **Testen**: http://localhost:8080

### Upgrade von v1.0.0

Wenn Sie bereits v1.0.0 installiert haben:

1. **Stoppen** Sie den alten Server (Strg+C)
2. **Sichern** Sie Ihre `config/apis.json` (falls angepasst)
3. **Ersetzen** Sie die Dateien:
   - `server.js` (wichtig!)
   - `dist/bundle.js` (wichtig!)
   - Optional: andere Dateien
4. **Starten** Sie den neuen Server

### Was sich geändert hat

**Dateien aktualisiert:**
- ✅ `server.js` - CORS-Proxy hinzugefügt
- ✅ `dist/bundle.js` - Proxy-Unterstützung im Client
- ✅ `src/utils/apiClient.js` - useProxy Option

**Keine Änderungen:**
- ✅ `config/apis.json` - Ihre Konfiguration bleibt kompatibel
- ✅ API & UI - Keine Breaking Changes

## 🔄 Unterschied zu v1.0.0

### Vorher (v1.0.0)
```
Browser → Externe API ❌
"Access blocked by CORS policy"
```

### Jetzt (v1.0.1)
```
Browser → Lokaler Server → Externe API ✅
         (Proxy fügt CORS-Header hinzu)
```

## 🚀 Warum ist das wichtig?

CORS (Cross-Origin Resource Sharing) ist eine Browser-Sicherheitsfunktion, die verhindert, dass Webseiten auf APIs von anderen Domains zugreifen. Das ist für ein API-Test-Tool problematisch, da Sie ja genau das tun wollen!

**Mit v1.0.1:**
- ✅ Testen Sie **jede** API ohne CORS-Probleme
- ✅ Keine Browser-Extensions nötig
- ✅ Funktioniert out-of-the-box
- ✅ Sicher - läuft nur lokal

## 📝 Vollständige Changelog

```
v1.0.1 (2026-02-07)
-------------------
[FIXED]
- CORS-Fehler beim Testen externer APIs
- OPTIONS Preflight-Requests werden jetzt korrekt behandelt

[ADDED]
- Integrierter CORS-Proxy-Server (/api/proxy)
- Automatische CORS-Header für alle Responses
- useProxy Option im API-Client (standardmäßig aktiviert)

[CHANGED]
- server.js: Erweitert um Proxy-Funktionalität
- apiClient.js: Requests gehen standardmäßig über Proxy
```

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.1
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.1/api-tester-v1.0.1.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

---

**Empfehlung**: Alle Benutzer sollten auf v1.0.1 aktualisieren, um CORS-Probleme zu vermeiden.

Built with ❤️ using React, esbuild & Node.js
