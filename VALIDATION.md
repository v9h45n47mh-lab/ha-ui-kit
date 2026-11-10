# Prüfstand 1.0.0

Stand 10.11.2026:

- `npm run build`: erfolgreich.
- `npm test`: 3 Prüfungen bestanden (Escaping, Symbol-/Navigationsvertrag, Versionsbindung einschließlich Erkennen veränderter Dateien).
- `npm run check`: generierte Dateien und Prüfsummen stimmen mit den Quellen überein.
- JavaScript-Syntax der Quellen, Beispielkarte, Vorschau und Browserprüfungen geprüft.
- Vorlage: SVGs und Layoutwerte aus dem aktuellen Shutter Manager 1.4.0, Quellidentität siehe `docs/PROVENANCE.json`.
- Browserprüfungen laufen über GitHub Actions mit Mobil-/Desktopansichten, Themes, Dialogen und direktem Vergleich zur fest gebundenen Shutter-Manager-Vorlage. Ergebnisse und Vergleichsbilder stehen im Workflow `Validate UI Kit`.
- Öffentliches Repository: https://github.com/v9h45n47mh-lab/ha-ui-kit
- Ein separater Release-Tag wurde noch nicht angelegt.

`preview.html` ist die vollständig lokale, interaktive Vorschau. Bestehende HA-Integrationen wurden mit diesem Baukasten nicht umgestellt.
