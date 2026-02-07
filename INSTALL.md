# API Test Framework - Installationsanleitung

## Standalone Installation (ohne npm install)

Diese Anleitung beschreibt, wie Sie das API Test Framework auf einem Arbeitsplatz installieren und starten **ohne npm install**.

## Voraussetzungen

✅ **Node.js** muss installiert sein (Version 16 oder höher)
- Download: https://nodejs.org

**Das wars!** Keine weiteren Dependencies oder npm install erforderlich.

## Installation

### Schritt 1: Dateien kopieren

Entpacken Sie das Release-Paket in ein Verzeichnis Ihrer Wahl, z.B.:
- Windows: `C:\Programme\api-tester\`
- Linux/Mac: `/opt/api-tester/` oder `~/api-tester/`

### Schritt 2: Prüfen Sie den Inhalt

Das Verzeichnis sollte folgende Struktur haben:

```
api-tester/
├── index.html          # Haupt-HTML-Datei
├── server.js           # Eigenständiger Webserver (kein npm nötig!)
├── start.bat           # Start-Script für Windows
├── start.sh            # Start-Script für Linux/Mac
├── config/
│   └── apis.json       # API-Konfiguration
├── dist/
│   └── bundle.js       # React App Bundle
└── README.md           # Dokumentation
```

## Starten

### Windows

1. **Doppelklick** auf `start.bat`

ODER

2. Kommandozeile öffnen und ausführen:
   ```cmd
   cd C:\Programme\api-tester
   start.bat
   ```

### Linux / Mac

1. Terminal öffnen
2. Ausführbar machen (einmalig):
   ```bash
   chmod +x start.sh
   ```
3. Starten:
   ```bash
   ./start.sh
   ```

ODER direkt mit Node.js:
```bash
node server.js
```

## Zugriff auf die App

Nach dem Start öffnen Sie Ihren Browser und gehen Sie zu:

**http://localhost:8080**

Der Server zeigt Ihnen beim Start die genaue URL an.

## Konfiguration

### Port ändern

Standardmäßig läuft der Server auf Port 8080. Um den Port zu ändern:

**Windows:**
```cmd
set PORT=3000 && node server.js
```

**Linux/Mac:**
```bash
PORT=3000 node server.js
```

### Neue APIs hinzufügen

1. Öffnen Sie `config/apis.json`
2. Fügen Sie Ihre API-Definition hinzu:

```json
{
  "apis": [
    {
      "id": "my_api",
      "name": "Meine API",
      "endpoint": "https://api.example.com/endpoint",
      "method": "POST",
      "auth": { "type": "none" },
      "fields": [
        {
          "name": "username",
          "label": "Benutzername",
          "type": "text",
          "defaultValue": "",
          "required": true
        }
      ]
    }
  ]
}
```

3. Speichern Sie die Datei
4. Browser aktualisieren (F5)

**Kein Rebuild erforderlich!** Die Konfiguration wird zur Laufzeit geladen.

## Firewall / Netzwerk

Falls Sie nicht auf http://localhost:8080 zugreifen können:

1. **Firewall-Regel hinzufügen** für Node.js (falls gefragt)
2. **Port freigeben** in Ihrer Firewall für Port 8080
3. **Alternativ anderen Port verwenden** (siehe "Port ändern")

## Troubleshooting

### "Node.js ist nicht installiert"

**Problem:** Beim Start erscheint die Meldung "Node.js ist nicht installiert"

**Lösung:**
1. Node.js von https://nodejs.org herunterladen
2. Installieren (Standardeinstellungen OK)
3. Terminal/Kommandozeile neu öffnen
4. Erneut versuchen

### "Port bereits in Verwendung"

**Problem:** Fehler "EADDRINUSE" oder "Port bereits belegt"

**Lösung:**
- Anderen Port verwenden (siehe "Port ändern")
- ODER: Prozess beenden, der Port 8080 verwendet

**Windows:**
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8080 | xargs kill
```

### "Seite lädt nicht / weiße Seite"

**Problem:** Browser zeigt leere Seite

**Lösung:**
1. Strg+Shift+R drücken (Hard Refresh)
2. Browser-Cache leeren
3. Browser-Konsole öffnen (F12) und Fehler prüfen
4. Server-Logs in der Kommandozeile prüfen

### API-Aufrufe schlagen fehl (CORS)

**Problem:** API-Requests werden blockiert mit CORS-Fehler

**Lösung:**
- CORS ist eine Browser-Sicherheitsfunktion
- Die API muss CORS-Header senden
- Für Tests: Browser-CORS-Extension verwenden (nur zu Testzwecken!)
- Produktiv: Proxy-Server verwenden oder API anpassen

## Updates

Um das Framework zu aktualisieren:

1. Altes Verzeichnis sichern (insbesondere `config/apis.json`)
2. Neues Release entpacken
3. Ihre `config/apis.json` zurückkopieren
4. Neu starten

## Deinstallation

1. Server beenden (Strg+C)
2. Verzeichnis löschen
3. Fertig - keine Registry-Einträge oder versteckte Dateien

## Support

Bei Problemen:
- README.md konsultieren
- GitHub Issues: https://github.com/drabeka/api-tester/issues
- Logs prüfen (werden in der Konsole angezeigt)

## Lizenz

MIT License - Siehe LICENSE Datei
