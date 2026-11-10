# HA UI Kit

Gemeinsamer UI-Baukasten für unsere Home-Assistant-Integrationen. **Version 1.3.1**, visuelle Hauptvorlage: **Shutter Manager 1.4.0**.

Der Baukasten legt Symbole, Farben, Schriftgrößen, Abstände, Navigation, kompakte Einstellungszeilen, Buttons, Schalter, Eingaben und Dialoge zentral fest. Jede Integration liefert dieselbe fest eingebundene Version mit. Es gibt keine zusätzliche HA-Integration, keinen CDN-Aufruf und keine Laufzeitabhängigkeit von diesem Repository.

## Enthalten

- HA-Theme-Variablen einschließlich dunkler Themes; neutrale und ausgewählte Einstellungen in den Originalfarben.
- Original-SVGs aus Shutter Manager, einschließlich Zahnrad, Bearbeiten, Löschen, Kopieren, Sonnenaufgang und Sonnenuntergang.
- Kompakte einklappbare Bereiche, Navigation mit Hilfe/Einstellungen rechts und Zeilen mit einheitlichen Aktionssymbolen.
- Formulare, Filter, Schalter, Versionsanzeige und native modale Dialoge mit Tastatur- und Fokusverhalten.
- `programAddButton()` für „+ Programm“ und `programOrderButtons()` für die Sortierpfeile ↑ / ↓ nach Shutter Manager; Pfeile in der HA-Akzentfarbe (standardmäßig Hellblau).
- Gefüllte Primärbuttons, transparente Text-/Plusbuttons (z. B. „Hausarbeit“), Speichern, Abbrechen, Löschen, Symbolbuttons und deaktivierte Speicherzustände.
- Durchsuchbare Einzel-/Mehrfachauswahl, gesperrte Einträge, Bereiche, Checkboxen, Wochentage, Zahlen mit Schnellwerten, Textbereiche, Links und gruppierte Dropdowns.
- Prozent-/Positionsregler, unveränderte Werte, Kelvinregler und Farbrad mit Maus-, Touch- und Tastaturbedienung.
- Zeitfenster, Saison ohne Jahreszahl, Datumsbereiche und Wiederholung mit monatlichen Mustern und abwechselnden Personen.
- Quadratische Kontokacheln: `accountTile` / `accountTiles`, zwei gleich breite Spalten auch mobil, Name oben links und großer mittiger Wert.
- Programmgruppen, Programm-/Aktionszeilen, Aktionseditoren, Messwerte, Status, Zähler, Verlauf, Monatsgruppen und Statistiktabellen.
- Wochenkalender, Datumsnavigation, Tagesaufgaben, Erledigungscheckboxen, Sprachwahl, Sicherungsimport/-export, Hilfeseiten und Panel-Kopfbereich.
- Hinweise, Formularfehler, Leer-/Ladezustände, Bestätigungsdialoge und Gartenarbeits-Fotos mit lokaler Verkleinerung, Vorschau und Großansicht; optionale Wisch-/Aktualisierungsgesten.
- Handyansicht bis 600 px, umbrechende lange Namen, optional nur am Desktop sichtbare Aktionen.
- Eigenständiges ES-Modul, lesbare CSS-Datei, Versions-/Prüfsummenmanifest und Kopierwerkzeug.
- Interaktive [Beispielkarte](examples/index.html), Integrationsanleitung und automatisierte Prüfungen.

Alle Objekte, ihre Herkunft und Ereignisse: [Bausteinkatalog](docs/COMPONENTS.md). Bei mehreren Vorlagen gilt **Shutter → Light → Essensplaner → Haushalt → Spülmaschine → Access Manager**. Einmalige Objekte stammen aus ihrer jeweiligen Implementierung; Fotos aus Gartenarbeit. Der Baukasten übernimmt Darstellung und lokale Bedienung; Berechtigungen, Speicherung und Automationen bleiben in den Integrationen.

## In eine Integration übernehmen

Den gewünschten Release dieses Repositories lokal auschecken. Anschließend:

```sh
node scripts/vendor.mjs --target /pfad/zur/integration/custom_components/DOMAIN/frontend
node scripts/vendor.mjs --target /pfad/zur/integration/custom_components/DOMAIN/frontend --check
```

Das kopiert die Versionsdateien nach `frontend/family-ui/1.3.1/` und schreibt `frontend/family-ui.lock.json`. Die Karte importiert lokal:

```js
import {UI_CSS, UI_VERSION, navigation, row, iconButton, bindUI} from './family-ui/1.3.1/family-ui.js';
```

Die Stile gelten innerhalb des **ShadowRoot der Karte**. Details, Einbindung der Ereignisse und Backend-Auslieferung: [INTEGRATION.md](docs/INTEGRATION.md).

## Vorschau und Entwicklung

`preview.html` zeigt die kompakte Beispielkarte, `gallery.html` den vollständigen interaktiven Bausteinkatalog einschließlich beider Plusbuttons. Beide Dateien können direkt per Doppelklick geöffnet werden und enthalten alle benötigten Stile, Symbole und Skripte. Für die Entwicklung stehen zusätzlich modulare Beispiele bereit:

```sh
npm run build
npm test
npm run check
python -m http.server 8080
```

Im Browser `http://localhost:8080/examples/` oder `http://localhost:8080/examples/gallery.html` öffnen. Dort lassen sich die Bausteine und das helle/dunkle Theme ausprobieren. Beide Beispiele arbeiten ausschließlich mit lokalen Beispieldaten.

Für Browserprüfungen:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Optional `CHROMIUM_PATH` setzen, um ein vorhandenes Chromium zu verwenden. Tests prüfen 375, 390, 430 und 1100 px, Themes, Tastatur, Dialogfokus, mehrere unabhängig eingebundene Karten und die Interaktionen des Katalogs einschließlich Dateiauswahl. Die Bilder landen in `test-results/`.

## Verbindlicher Layoutstandard

Die genaue Zuordnung steht in [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md). Änderungen an gemeinsamen Elementen erfolgen hier und werden anschließend als neue, fest gebundene UI-Version in die betroffenen Integrationen übernommen. Bestehende Integrationen verwenden den Baukasten **erst nach ihrer jeweiligen Umstellung**; ein Update dieses Repositories allein ändert sie nicht. Der Stand der Übernahme ist in [ADOPTION.md](docs/ADOPTION.md) dokumentiert.

Die SVG- und Layoutvorlage ist mit Version, Commit und Datei in [PROVENANCE.json](docs/PROVENANCE.json) festgehalten. Lizenz: [MIT](LICENSE).
