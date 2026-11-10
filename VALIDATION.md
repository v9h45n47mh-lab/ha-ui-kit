# Prüfstand 1.2.0

Stand 10.11.2026:

- `npm run build`: erfolgreich; Modul, CSS, Manifest, kompakte Vorschau und vollständige Galerie erzeugt.
- `npm test`: 15 Prüfungen bestanden; Escaping, APIs, Versionsbindung, Geräteauswahl, Wochentage, Felder, Reglergrenzen, Saison, Kalender, Farbwerte, Wiederholungen, JSON-Import und Fotogrenzen.
- `npm run check`: generierte Dateien und Prüfsummen stimmen mit den Quellen überein.
- Browserprüfungen: `tests/browser.cjs` prüft die ursprünglichen Komponenten und die Shutter-Geometrie; `tests/gallery.cjs` prüft sämtliche zusätzlichen Objektfamilien und ihre Bedienung. Aktueller Workflowstatus ist vor Abschluss zu prüfen.
- Galerie: Buttons inklusive „+ Programm“ und transparentem „+ Hausarbeit“, Suche, gesperrte Mehrfachauswahl, Prozent/Kelvin/Farbe, Datums-/Saisonvalidierung, Wiederholung, Programme, Kalender, Erledigung, Verlauf, JSON-Import/-Export, Fotoaufbereitung, Bestätigung, Sprache, Panel und Gesten.
- Ansichten: kompakte Karte 375/390/430/1100 px; Galerie 375/390/1100 px, jeweils helle/dunkle Themes. Der Workflow speichert Ansichts- und Vergleichsbilder unter `ui-screenshots`.
- Quellpriorität und Objektzuordnung: `docs/COMPONENTS.md`; exakte Quellidentitäten: `docs/PROVENANCE.json`.
- `preview.html` und `gallery.html` sind vollständig lokale interaktive Vorschauen. Ein separater Release-Tag für 1.2.0 wurde noch nicht angelegt.
- Die Prüfungen validieren den Baukasten mit Beispieldaten, keine produktive HA-Verbindung. Übernahmen in Anwendungen werden gesondert veröffentlicht und in `docs/ADOPTION.md` dokumentiert.
