# API Test Framework v1.0.6 - Business UI Redesign 🎨

**Major UI Update** - Moderne Business-Oberfläche mit professionellem Look & Feel!

## ✨ UI Redesign

### Neues Farbschema
- **Hintergrund**: Helles Grau (`#fafafa`) statt Gradient
- **Primary Color**: Business-Blau (`#3d6ab3`) statt Lila
- **Cards**: Helles Grau (`#f5f5f5`) für cleanen Look
- **Inputs**: Weiß für maximalen Kontrast

### Verbesserte Typografie
- **Labels**: Normal gewichtet (400), dezenter Grauton
- **Input-Werte**: Fett (600) für bessere Lesbarkeit
- **Bessere visuelle Hierarchie**: Daten stechen hervor, Labels im Hintergrund

### Moderne UI-Elemente
- **Custom Dropdown-Pfeile**: Blaue gefüllte Dreiecke
- **Cleane Shadows**: Subtiler, professioneller Look
- **Abgerundete Ecken**: 4-6px für Business-Look
- **Focus-States**: Ring-Shadow bei Fokus

### Design-Prinzipien
- ✅ Professionelles Business-Design
- ✅ Klare visuelle Hierarchie
- ✅ Maximale Lesbarkeit
- ✅ Moderne, cleane Ästhetik
- ✅ Konsistente Farbpalette

## 📝 Vorher/Nachher

### Vorher (v1.0.5)
- Lila Gradient-Hintergrund
- Purple Primary Color (#667eea)
- Labels fett, Daten normal
- Standard Browser-Dropdown-Pfeile
- Weiße Cards auf buntem Hintergrund

### Nachher (v1.0.6)
- Helles graues Background
- Business-Blau (#3d6ab3)
- Labels normal, Daten fett
- Custom blaue Dropdown-Pfeile
- Graue Cards auf hellem Hintergrund

## 🎯 Alle Features

### Funktional (aus v1.0.5)
- ✅ Konfigurierbare Content-Type und Accept Header pro API
- ✅ CORS-Proxy für externe APIs
- ✅ Bearer Token und API Key Authentication
- ✅ SSL-Zertifikat-Toleranz
- ✅ Multiple API-Endpoints via JSON-Config
- ✅ Request History und Favorites
- ✅ JSON Syntax Highlighting

### Design (NEU in v1.0.6)
- ✅ Business-Look & Feel
- ✅ Professionelle Farbpalette
- ✅ Optimierte Typografie
- ✅ Custom UI-Elemente
- ✅ Cleanes, modernes Design

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.6.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.6.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`
4. **Öffnen**: `http://localhost:3000`

### Upgrade von v1.0.0-v1.0.5

**Wichtig**: Nur `index.html` hat sich geändert (UI-Styles)!

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie die Datei:
   - `index.html` ← **Neue UI-Styles**
3. **Optional**: `dist/bundle.js` für neuesten Build
4. **Starten** Sie den Server neu

Ihre `config/apis.json` und `server.js` bleiben unverändert!

## 🔄 Changelog

### v1.0.6 (2026-02-07)

**[REDESIGNED]**
- ✅ Komplettes UI-Redesign mit Business-Look
- ✅ Neue Farbpalette (Blau statt Lila)
- ✅ Heller Hintergrund statt Gradient
- ✅ Verbesserte Typografie-Hierarchie
- ✅ Custom Dropdown-Pfeile (blau, gefüllt)
- ✅ Graue Cards für cleanen Look
- ✅ Professionelle Shadows und Borders

**[IMPROVED]**
- ✅ Labels weniger prominent (font-weight: 400)
- ✅ Input-Daten hervorgehoben (font-weight: 600)
- ✅ Bessere visuelle Hierarchie
- ✅ Cleaner, professioneller Look

**[TECHNICAL]**
- Alle Styles in `index.html` (kein separates CSS-File)
- Custom SVG für Dropdown-Indikatoren
- Optimierte CSS-Selektoren

## 📊 Design-Vergleich

| Element | v1.0.5 | v1.0.6 |
|---------|--------|--------|
| Hintergrund | Lila Gradient | Helles Grau (#fafafa) |
| Primary Color | Lila (#667eea) | Blau (#3d6ab3) |
| Cards | Weiß | Helles Grau (#f5f5f5) |
| Labels | Fett (600) | Normal (400) |
| Daten | Normal (normal) | Fett (600) |
| Dropdown-Pfeil | Browser-Standard | Custom Blau SVG |
| Shadows | Prominent (4-6px) | Subtil (1-3px) |
| Border-Radius | 12px | 4-6px |
| Style | Modern/Playful | Business/Professional |

## 🎨 Farbpalette

### Primary Colors
- **Business-Blau**: `#3d6ab3` (Buttons, Active States, Links)
- **Blau Hover**: `#2d5a9d` (Button Hover)

### Backgrounds
- **Page**: `#fafafa` (Sehr helles Grau)
- **Cards**: `#f5f5f5` (Helles Grau)
- **Inputs**: `white` (Weiß)

### Text Colors
- **Primary Text**: `#1a202c` (Dunkel, Input-Werte)
- **Labels**: `#4a5568` (Mittelgrau)
- **Subtitle**: `#666` (Grau)

### Borders & Shadows
- **Border**: `#cbd5e0` (Hellgrau)
- **Focus Ring**: `rgba(61, 106, 179, 0.1)` (Blau transparent)
- **Shadow**: `rgba(0, 0, 0, 0.08)` (Sehr subtil)

## 🚀 Warum upgraden?

**Falls Sie v1.0.0-v1.0.5 verwenden:**
- Professionellerer Look für Business-Umgebung
- Bessere Lesbarkeit durch optimierte Typografie
- Moderne, cleane UI
- Alle vorherigen Funktionen bleiben erhalten

**Empfohlener Upgrade-Pfad:**
1. Alle Versionen vor v1.0.5 → v1.0.6 (für Funktionen UND Design)
2. v1.0.5 → v1.0.6 (nur für neues Design)

## 🧪 Testing-Checklist

Nach dem Upgrade:

- [ ] UI erscheint in Business-Blau statt Lila
- [ ] Hintergrund ist helles Grau statt Gradient
- [ ] Labels sind normal gewichtet
- [ ] Input-Werte sind fett
- [ ] Dropdown-Pfeile sind blau und gefüllt
- [ ] Alle Funktionen (API-Calls, Auth, etc.) funktionieren

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.6
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.6/api-tester-v1.0.6.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich

## 📸 Screenshots

Das neue Design orientiert sich an modernen Business-Anwendungen:
- Klare, professionelle Optik
- Optimale Lesbarkeit
- Konsistentes Farbschema
- Moderne UI-Patterns

---

**Empfehlung**: **Upgrade auf v1.0.6** für professionelles Business-Design!

Built with ❤️ using React, esbuild & Node.js
