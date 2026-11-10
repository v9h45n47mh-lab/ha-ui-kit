# HA UI Kit

Gemeinsamer UI-Baukasten für unsere Home-Assistant-Integrationen. **Version 1.0.0**, visuelle Vorlage: **Shutter Manager 1.4.0**.

Der Baukasten legt Symbole, Farben, Schriftgrößen, Abstände, Navigation, kompakte Einstellungszeilen, Buttons, Schalter, Eingaben und Dialoge zentral fest. Jede Integration liefert dieselbe fest eingebundene Version mit. Es gibt keine zusätzliche HA-Integration, keinen CDN-Aufruf und keine Laufzeitabhängigkeit von diesem Repository.

## Enthalten

- HA-Theme-Variablen einschließlich dunkler Themes; neutrale und ausgewählte Einstellungen in den Originalfarben.
- Original-SVGs aus Shutter Manager, einschließlich Zahnrad, Bearbeiten, Löschen, Kopieren, Sonnenaufgang und Sonnenuntergang.
- Kompakte einklappbare Bereiche, Navigation mit Hilfe/Einstellungen rechts und Zeilen mit einheitlichen Aktionssymbolen.
- Formulare, Filter, Schalter, Versionsanzeige und native modale Dialoge mit Tastatur- und Fokusverhalten.
- Handyansicht bis 600 px, umbrechende lange Namen, optional nur am Desktop sichtbare Aktionen.
- Eigenständiges ES-Modul, lesbare CSS-Datei, Versions-/Prüfsummenmanifest und Kopierwerkzeug.
- Interaktive [Beispielkarte](examples/index.html), Integrationsanleitung und automatisierte Prüfungen.

## In eine Integration übernehmen

Den gewünschten Release dieses Repositories lokal auschecken. Anschließend:

```sh
node scripts/vendor.mjs --target /pfad/zur/integration/custom_components/DOMAIN/frontend
node scripts/vendor.mjs --target /pfad/zur/integration/custom_components/DOMAIN/frontend --check
```

Das kopiert die Release-Dateien nach `frontend/family-ui/1.0.0/` und schreibt `frontend/family-ui.lock.json`. Die Karte importiert lokal:

```js
import {UI_CSS, UI_VERSION, navigation, row, iconButton, bindUI} from './family-ui/1.0.0/family-ui.js';
```

Die Stile gelten innerhalb des **ShadowRoot der Karte**. Details, Einbindung der Ereignisse und Backend-Auslieferung: [INTEGRATION.md](docs/INTEGRATION.md).

## Vorschau und Entwicklung

`preview.html` kann direkt per Doppelklick im Browser geöffnet werden. Die Datei enthält alle benötigten Stile, Symbole und Skripte und benötigt keinen Server. Für die Entwicklung steht zusätzlich das modulare Beispiel bereit:

```sh
npm run build
npm test
npm run check
python -m http.server 8080
```

Im Browser `http://localhost:8080/examples/` öffnen. Dort lassen sich Navigation, Einklappen, Schalter, Bearbeitungsdialog und helles/dunkles Theme ausprobieren. Die Beispielkarte arbeitet ausschließlich mit lokalen Beispieldaten.

Für Browserprüfungen:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Optional `CHROMIUM_PATH` setzen, um ein vorhandenes Chromium zu verwenden. Tests prüfen 375, 390, 430 und 1100 px, Themes, Tastatur, Dialogfokus und mehrere unabhängig eingebundene Karten. Die Bilder landen in `test-results/`.

## Verbindlicher Layoutstandard

Die genaue Zuordnung steht in [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md). Änderungen an gemeinsamen Elementen erfolgen hier und werden anschließend als neue, fest gebundene UI-Version in die betroffenen Integrationen übernommen. Bestehende Integrationen verwenden den Baukasten **erst nach ihrer jeweiligen Umstellung**; ein Update dieses Repositories allein ändert sie nicht. Der Stand der Übernahme ist in [ADOPTION.md](docs/ADOPTION.md) dokumentiert.

Die SVG- und Layoutvorlage ist mit Version, Commit und Datei in [PROVENANCE.json](docs/PROVENANCE.json) festgehalten. Lizenz: [MIT](LICENSE).
