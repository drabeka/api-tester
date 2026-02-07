# GitHub Release erstellen

Der Git-Tag **v1.0.0** wurde bereits erstellt und gepusht.

## Release auf GitHub erstellen

### Option 1: Über GitHub Web-Interface

1. Gehen Sie zu: https://github.com/drabeka/api-tester/releases/new

2. **Tag**: Wählen Sie `v1.0.0` aus

3. **Release Title**: `API Test Framework v1.0.0 - Standalone Release`

4. **Description**: Kopieren Sie folgenden Text:

```markdown
# API Test Framework v1.0.0 🚀

Erste stabile Release des API Test Frameworks - bereit für den produktiven Einsatz!

## ✨ Highlights

- **Keine npm install erforderlich** - nur Node.js benötigt
- **Eigenständiger Webserver** - einfach starten mit `start.bat`
- **JSON-basierte Konfiguration** - APIs ohne Code-Änderungen hinzufügen
- **Vollständiges React-Frontend** - modernes, responsives Design
- **Authentifizierung** - Support für Bearer Token und API Keys
- **Request-Historie & Favoriten** - letzten 20 Requests automatisch gespeichert
- **JSON-Syntax-Highlighting** - schöne Darstellung der Responses

## 📦 Installation

### Schnellstart (Windows)

1. **Download**: `api-tester-v1.0.0.tar.gz` herunterladen
2. **Entpacken**: In ein beliebiges Verzeichnis
3. **Starten**: Doppelklick auf `start.bat`
4. **Fertig**: Browser öffnet automatisch auf http://localhost:8080

### Voraussetzungen

- ✅ **Node.js** (v16 oder höher) - [Download](https://nodejs.org)
- ❌ **KEIN npm install** erforderlich
- ❌ **KEINE Build-Tools** erforderlich

## 📖 Dokumentation

Nach dem Entpacken finden Sie:
- `INSTALL.md` - Ausführliche Installationsanleitung
- `README.md` - Vollständige Feature-Dokumentation
- `config/apis.json` - Beispiel-Konfiguration

## 🆕 Was ist neu?

- Vollständiges React-Frontend mit 6 Komponenten
- Eigenständiger HTTP-Server in reinem Node.js
- JSON-basierte API-Konfiguration
- LocalStorage-Persistenz für Historie und Auth
- Modernes, responsives Design
- Keyboard-Shortcuts (Strg+Enter)
- Umfangreiche Dokumentation

---

**Built with ❤️ using React, esbuild & Node.js**
```

5. **Attach Binary**: Laden Sie die Datei hoch:
   - `c:\Data\react-projects\api-tester\release\api-tester-v1.0.0.tar.gz`

6. Klicken Sie auf **Publish release**

### Option 2: Mit GitHub CLI (falls installiert)

```bash
gh release create v1.0.0 \
  release/api-tester-v1.0.0.tar.gz \
  --title "API Test Framework v1.0.0 - Standalone Release" \
  --notes-file RELEASE_NOTES.md
```

## Release-Dateien

Das Release-Archiv befindet sich hier:
- **Lokaler Pfad**: `c:\Data\react-projects\api-tester\release\api-tester-v1.0.0.tar.gz`
- **Größe**: ~24 KB (komprimiert)

## Inhalt des Release-Archivs

```
api-tester-v1.0.0/
├── index.html          # Haupt-HTML-Datei
├── server.js           # Eigenständiger Webserver
├── start.bat           # Windows-Start-Script
├── README.md           # Dokumentation
├── INSTALL.md          # Installationsanleitung
├── config/
│   └── apis.json       # API-Konfiguration (Beispiel)
└── dist/
    └── bundle.js       # React App Bundle (13.3 KB)
```

## Nach der Veröffentlichung

Benutzer können das Release herunterladen:

```bash
# Download
wget https://github.com/drabeka/api-tester/releases/download/v1.0.0/api-tester-v1.0.0.tar.gz

# Entpacken
tar -xzf api-tester-v1.0.0.tar.gz

# Starten (Windows)
cd api-tester-v1.0.0
start.bat

# Starten (Linux/Mac)
cd api-tester-v1.0.0
node server.js
```

## Nächste Schritte

1. Release auf GitHub erstellen (siehe oben)
2. README.md mit Release-Link aktualisieren
3. Dokumentation erweitern falls nötig
4. Feedback von Nutzern sammeln
