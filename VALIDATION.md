# Prüfstand 1.0.0

Stand 10.11.2026:

- `npm run build`: erfolgreich.
- `npm test`: 3 Prüfungen bestanden (Escaping, Symbol-/Navigationsvertrag, Versionsbindung einschließlich Erkennen veränderter Dateien).
- `npm run check`: generierte Dateien und Prüfsummen stimmen mit den Quellen überein.
- JavaScript-Syntax der Quellen, Beispielkarte, Vorschau und Browserprüfungen geprüft.
- Vorlage: SVGs und Layoutwerte aus dem aktuellen Shutter Manager 1.4.0, Quellidentität siehe `docs/PROVENANCE.json`.
- Browserprüfungen für Mobil-/Desktopansichten, Themes, Dialoge und den direkten Vorlagenvergleich sind vorbereitet. **In dieser Arbeitsumgebung nicht ausgeführt:** Chromium lässt sich hier nicht starten, der separate Vorschau-Browser erreicht den lokalen Webserver nicht. Eine visuelle Freigabe steht daher aus.
- GitHub-Actions-Workflow ist vorbereitet. Ein Repository und ein öffentlicher Release sind noch nicht angelegt.

`preview.html` ist die vollständig lokale, interaktive Vorschau. Nach Veröffentlichung kann der bereitliegende Workflow die Browserprüfungen ausführen und Vergleichsbilder erzeugen. Bestehende HA-Integrationen wurden mit diesem Paket nicht umgestellt.
