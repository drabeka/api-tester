# API Test Framework v1.0.5 - Custom Media Types 🎯

**Neues Feature** - Konfigurierbare Content-Type und Accept Header pro API!

## ✨ Neue Features

### Konfigurierbare Media Types
Jede API kann jetzt **eigene Content-Types** in der Konfiguration definieren:

```json
{
  "apis": [
    {
      "id": "json_api",
      "name": "JSON API",
      "endpoint": "https://api.example.com/v1/data",
      "method": "POST",
      "contentType": "application/json",
      "accept": "application/json"
    },
    {
      "id": "xml_api",
      "name": "XML API",
      "endpoint": "https://api.example.com/xml",
      "method": "POST",
      "contentType": "application/xml",
      "accept": "application/xml"
    },
    {
      "id": "custom_api",
      "name": "Custom Vendor API",
      "endpoint": "https://api.vendor.com/v2",
      "method": "POST",
      "contentType": "application/vnd.vendor.v2+json",
      "accept": "application/vnd.vendor.v2+json"
    }
  ]
}
```

## 🔧 Technische Details

### Neue Konfigurationsfelder

**`contentType`** (optional, default: `"application/json"`):
- Definiert den `Content-Type` Header für Requests
- Wird nur bei POST/PUT/PATCH mit nicht-leerem Body gesendet
- Beispiele:
  - `"application/json"`
  - `"application/xml"`
  - `"text/xml"`
  - `"application/x-www-form-urlencoded"`
  - `"application/vnd.api+json"` (JSON API Spec)
  - `"application/vnd.company.v1+json"` (Custom Vendor)

**`accept`** (optional, default: `"*/*"`):
- Definiert den `Accept` Header für Responses
- Teilt der API mit, welches Format Sie erwarten
- Beispiele:
  - `"application/json"`
  - `"application/xml"`
  - `"text/plain"`
  - `"application/vnd.vendor+json"`

### Code-Änderungen

**config/apis.json**:
```json
{
  "contentType": "application/json",  // Neu: Request Content-Type
  "accept": "application/json"        // Neu: Response Accept Header
}
```

**src/utils/apiClient.js**:
- Accept Header wird aus Config gelesen und gesetzt
- Content-Type wird aus Config gelesen (nicht mehr hardcoded)
- Content-Type nur bei POST/PUT/PATCH mit Body

**server.js**:
- Verbessertes Logging für leere Request Bodies
- Prüft ob Payload wirklich Inhalt hat

## 🐛 Behobene Probleme

### 415 Unsupported Media Type
**Problem in v1.0.4**:
- Alle APIs mussten `application/json` verwenden
- APIs mit proprietären Media Types wurden abgelehnt (415)
- Keine Möglichkeit, XML oder andere Formate zu nutzen

**Gelöst in v1.0.5**:
- ✅ Jede API kann eigenen Content-Type definieren
- ✅ Support für Standard-Types (JSON, XML, etc.)
- ✅ Support für Custom Vendor Types (vnd.*)
- ✅ Content-Type nur bei Requests mit Body

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.5.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.5.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`

### Upgrade von v1.0.0-v1.0.4

**Wichtig**: Mehrere Dateien haben sich geändert!

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie folgende Dateien:
   - `dist/bundle.js` ← Client-Code mit neuem Feature
   - `server.js` ← Verbessertes Logging
   - `config/apis.json` ← Optionale neue Felder hinzufügen
3. **Starten** Sie den Server neu

### Migration der Konfiguration

**Optional** - Fügen Sie zu Ihren APIs hinzu:

```json
{
  "id": "ihre_api",
  "contentType": "application/json",  // Ihr gewünschter Content-Type
  "accept": "application/json"        // Ihr gewünschter Accept Header
}
```

Wenn nicht angegeben, werden die Defaults verwendet:
- `contentType`: `"application/json"`
- `accept`: `"*/*"`

## 🔄 Changelog

### v1.0.5 (2026-02-07)

**[ADDED]**
- ✅ Konfigurierbare `contentType` pro API
- ✅ Konfigurierbare `accept` Header pro API
- ✅ Support für Custom Vendor Media Types
- ✅ Support für XML, JSON API, und andere Standards

**[FIXED]**
- ✅ 415 Unsupported Media Type bei Custom APIs
- ✅ Content-Type wird nur bei non-empty Body gesendet
- ✅ Accept Header wird korrekt aus Config gesetzt

**[IMPROVED]**
- ✅ Besseres Logging für leere Request Bodies
- ✅ Payload-Validierung vor dem Senden

**[CHANGED]**
- `config/apis.json`: Neue optionale Felder
- `src/utils/apiClient.js`: Content-Type/Accept aus Config
- `src/components/RequestForm.jsx`: Parameter-Weiterleitung
- `server.js`: Logging-Verbesserungen

## 📊 Unterstützte Media Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| `application/json` | Standard JSON | REST APIs |
| `application/xml` | XML Format | SOAP, Legacy APIs |
| `text/xml` | XML Text | Alternative XML |
| `application/x-www-form-urlencoded` | Form Data | HTML Forms |
| `application/vnd.api+json` | JSON API Spec | Standardized JSON APIs |
| `application/vnd.vendor.v1+json` | Custom Vendor | Proprietary APIs |

## 🧪 Testing-Checklist

Nach dem Upgrade:

- [ ] Bestehende APIs → Sollten weiter funktionieren
- [ ] API mit `contentType: "application/json"` → Sollte funktionieren
- [ ] API mit `contentType: "application/xml"` → Sollte funktionieren
- [ ] API mit Custom Vendor Type → **Sollte jetzt funktionieren!**
- [ ] Request ohne Body (GET) → Kein Content-Type Header

## 📝 Beispiel-Konfigurationen

### JSON API
```json
{
  "id": "users_api",
  "endpoint": "https://api.example.com/users",
  "method": "POST",
  "contentType": "application/json",
  "accept": "application/json"
}
```

### XML API
```json
{
  "id": "soap_api",
  "endpoint": "https://api.example.com/soap",
  "method": "POST",
  "contentType": "application/xml",
  "accept": "application/xml"
}
```

### Custom Vendor API
```json
{
  "id": "vendor_api",
  "endpoint": "https://vendor.com/api/v2",
  "method": "POST",
  "contentType": "application/vnd.mycompany.v2+json",
  "accept": "application/vnd.mycompany.v2+json"
}
```

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.5
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.5/api-tester-v1.0.5.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

---

**Empfehlung**: **Upgrade auf v1.0.5** wenn Sie Custom Media Types oder XML-APIs verwenden!

Built with ❤️ using React, esbuild & Node.js
