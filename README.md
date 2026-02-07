# API Test Framework

Ein flexibles, benutzerfreundliches Framework zum Testen von REST APIs.

## Features

- ✅ **Mehrere APIs** - Unterstützung für beliebig viele API-Endpunkte über JSON-Konfiguration
- 🔐 **Authentifizierung** - Support für Bearer Token und API Keys
- 📜 **Request-Historie** - Automatische Speicherung der letzten 20 Requests
- ⭐ **Favoriten** - Wichtige Requests als Favoriten markieren
- 🎨 **Syntax-Highlighting** - Formatierte JSON-Anzeige mit Syntax-Highlighting
- 💾 **LocalStorage** - Persistente Speicherung von Historie, Favoriten und Auth-Konfiguration
- ⚡ **Standalone** - Keine npm-Installation für Endnutzer erforderlich

## Installation & Setup

### Voraussetzungen

- **Node.js** (v16 oder höher) - nur für Entwickler/Build-Prozess

### Entwickler-Setup

1. Repository klonen oder Dateien herunterladen

2. Dependencies installieren (einmalig):
   ```bash
   npm install
   ```

3. Bundle erstellen:
   ```bash
   npm run build
   ```

4. `index.html` im Browser öffnen

### Entwicklungsmodus (mit Watch)

Für automatisches Rebuilding bei Änderungen:

```bash
npm run dev
```

## Verwendung

### 1. API-Konfiguration

APIs werden in `config/apis.json` definiert:

```json
{
  "apis": [
    {
      "id": "my_api",
      "name": "Meine Test API",
      "description": "Optionale Beschreibung",
      "endpoint": "https://api.example.com/endpoint",
      "method": "POST",
      "auth": {
        "type": "none"
      },
      "fields": [
        {
          "name": "username",
          "label": "Benutzername",
          "type": "text",
          "defaultValue": "",
          "required": true
        },
        {
          "name": "age",
          "label": "Alter",
          "type": "number",
          "defaultValue": 25,
          "step": 1,
          "required": false
        },
        {
          "name": "role",
          "label": "Rolle",
          "type": "select",
          "defaultValue": "user",
          "options": [
            { "value": "user", "label": "Benutzer" },
            { "value": "admin", "label": "Administrator" }
          ],
          "required": true
        }
      ]
    }
  ]
}
```

### 2. Feld-Typen

Unterstützte Feld-Typen:

- **text** - Textfeld
- **number** - Zahlenfeld (mit optionalem `step`)
- **select** - Dropdown (mit `options`)
- **textarea** - Mehrzeiliges Textfeld

### 3. Authentifizierung

Authentifizierung kann pro API im "Auth"-Tab konfiguriert werden:

**Keine Authentifizierung:**
```json
"auth": { "type": "none" }
```

**Bearer Token:**
- Im Auth-Tab "Bearer Token" auswählen
- Token eingeben und speichern
- Wird als `Authorization: Bearer <token>` Header gesendet

**API Key:**
- Im Auth-Tab "API Key" auswählen
- API Key und Header-Name eingeben
- Wird als benutzerdefinierter Header gesendet (z.B. `X-API-Key: <key>`)

⚠️ **Sicherheitshinweis:** Auth-Daten werden in LocalStorage gespeichert - nur für Testzwecke verwenden!

### 4. Request-Historie

- Letzte 20 Requests werden automatisch gespeichert
- Anzeige von: API-Name, Timestamp, HTTP-Status, Duration
- **Wiederholen**: Request-Daten ins Formular laden
- **Favoriten**: Wichtige Requests markieren
- **Filter**: Alle Requests oder nur Favoriten anzeigen

### 5. Keyboard-Shortcuts

- **Strg+Enter** - Formular absenden (Request senden)

## Projektstruktur

```
api-tester/
├── src/
│   ├── App.jsx                 # Haupt-React-Komponente
│   ├── components/
│   │   ├── ApiSelector.jsx     # API-Auswahl Dropdown
│   │   ├── RequestForm.jsx     # Dynamisches Request-Formular
│   │   ├── ResponseViewer.jsx  # Response-Anzeige mit Syntax-Highlighting
│   │   ├── AuthConfig.jsx      # Authentifizierungs-Konfiguration
│   │   └── History.jsx         # Request-Historie & Favoriten
│   └── utils/
│       ├── apiClient.js        # API-Request-Handler mit Auth
│       └── storage.js          # LocalStorage-Verwaltung
├── config/
│   └── apis.json               # API-Definitionen
├── dist/
│   └── bundle.js               # Generiertes Bundle (nach Build)
├── build.js                    # esbuild-Konfiguration
├── package.json                # Node.js Dependencies (nur esbuild)
├── index.html                  # Entry-Point (im Browser öffnen)
└── README.md                   # Diese Datei
```

## Neue APIs hinzufügen

1. `config/apis.json` öffnen
2. Neues API-Objekt im `apis`-Array hinzufügen
3. Bundle neu erstellen: `npm run build`
4. Seite im Browser aktualisieren
5. Neue API erscheint im Dropdown

**Beispiel - JSONPlaceholder Test-API:**

```json
{
  "id": "jsonplaceholder_post",
  "name": "JSONPlaceholder - Create Post",
  "description": "Test API für POST-Requests",
  "endpoint": "https://jsonplaceholder.typicode.com/posts",
  "method": "POST",
  "auth": {
    "type": "none"
  },
  "fields": [
    {
      "name": "title",
      "label": "Titel",
      "type": "text",
      "defaultValue": "Mein Testpost",
      "required": true
    },
    {
      "name": "body",
      "label": "Inhalt",
      "type": "textarea",
      "defaultValue": "Das ist der Inhalt meines Posts.",
      "required": true
    },
    {
      "name": "userId",
      "label": "User ID",
      "type": "number",
      "defaultValue": 1,
      "required": true
    }
  ]
}
```

## Entwicklung & Erweiterung

### Build-System

Das Projekt verwendet **esbuild** für schnelles Bundling:

- React & ReactDOM werden als externe Dependencies markiert (geladen via CDN)
- JSX wird zu `React.createElement()` kompiliert
- Minifizierung im Produktionsmodus
- Sourcemaps im Entwicklungsmodus

### Komponenten hinzufügen

1. Neue Komponente in `src/components/` erstellen
2. In `App.jsx` importieren
3. `npm run build` ausführen

### Styling

CSS ist inline in `index.html`:

- Modernes, responsives Design
- Gradient-Hintergrund (lila/blau)
- Dunkles Code-Theme für Responses
- Mobile-freundlich (Grid-Layout)

## Bekannte Einschränkungen

- LocalStorage-Limit (ca. 5-10 MB) - bei sehr vielen Requests könnte Historie voll werden
- Auth-Tokens in LocalStorage sind nicht verschlüsselt (nur für Tests verwenden!)
- CORS-Probleme bei manchen APIs (Browser-Beschränkung)

## Troubleshooting

**Problem: Bundle wird nicht gefunden**
- Sicherstellen, dass `npm run build` erfolgreich ausgeführt wurde
- Prüfen ob `dist/bundle.js` existiert

**Problem: API-Konfiguration lädt nicht**
- Browser-Konsole auf Fehler prüfen
- `config/apis.json` Syntax validieren (z.B. mit jsonlint.com)

**Problem: CORS-Fehler**
- API muss CORS-Header senden
- Alternativ: Proxy-Server verwenden oder Browser-Extension (nur für Tests)

**Problem: React-Fehler in der Konsole**
- Prüfen ob React/ReactDOM vom CDN geladen werden (Internetverbindung)
- Alternativ: React lokal herunterladen und einbinden

## Lizenz

MIT

## Support

Bei Fragen oder Problemen, bitte ein Issue erstellen oder die Dokumentation konsultieren.
