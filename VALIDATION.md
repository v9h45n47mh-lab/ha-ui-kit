# Prüfstand 1.2.2

- Build, alle 16 Unit-Tests und Integritätsprüfung erfolgreich.
- Alle drei Browsersuiten erfolgreich in [GitHub Actions, Lauf 42875656692](https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/42875656692), Commit `a10971e3120bd36a71069aa9d6d962bc23ce796b`.
- `tests/program-rows.cjs` misst die tatsächlichen linken Textkanten: Programmname und Metadaten sind bei kurzen und mehrzeiligen Namen bündig bei 28 px. Allgemeine Symbolbuttons behalten 6 px Abstand.
- Geprüfte Ansichten: 320/390/1100 px, helle/dunkle Themes. Screenshots für Desktop, Handy und mehrzeilige Namen visuell geprüft. Keine Überläufe; Tastaturbedienung und barrierefreie Schalterbeschriftungen bleiben erhalten.
- Der Veröffentlichungsworkflow prüft den Stand erneut und erzeugt Release-Notizen aus dem passenden Changelog-Abschnitt.

# Prüfstand 1.2.1

Die bestehenden Unit- und Browserprüfungen werden um `tests/program-rows.cjs` ergänzt: lange Programmnamen bei 320/390/1100 px, hell/dunkel, keine wiederholten sichtbaren Schalternamen, erhaltene ARIA-Beschriftung und Tastaturereignisse. Veröffentlichung nur nach erfolgreichem Validate-Workflow.

# Prüfstand 1.2.0

Stand 10.11.2026:

- `npm run build`: erfolgreich; Modul, CSS, Manifest, kompakte Vorschau und vollständige Galerie erzeugt.
- `npm test`: 15 Prüfungen bestanden; Escaping, APIs, Versionsbindung, Geräteauswahl, Wochentage, Felder, Reglergrenzen, Saison, Kalender, Farbwerte, Wiederholungen, JSON-Import und Fotogrenzen.
- `npm run check`: generierte Dateien und Prüfsummen stimmen mit den Quellen überein.
- Browserprüfungen: `tests/browser.cjs` prüft die ursprünglichen Komponenten und die Shutter-Geometrie; `tests/gallery.cjs` prüft sämtliche zusätzlichen Objektfamilien und ihre Bedienung. Vollständig erfolgreich in [GitHub Actions, Lauf 42859705510](https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/42859705510), Commit `21f479eb7fddd5318b907151a7b7effb68b338b8`.
- Galerie: Buttons inklusive „+ Programm“ und transparentem „+ Hausarbeit“, Suche, gesperrte Mehrfachauswahl, Prozent/Kelvin/Farbe, Datums-/Saisonvalidierung, Wiederholung, Programme, Kalender, Erledigung, Verlauf, JSON-Import/-Export, Fotoaufbereitung, Bestätigung, Sprache, Panel und Gesten.
- Ansichten: kompakte Karte 375/390/430/1100 px; Galerie 375/390/1100 px, jeweils helle/dunkle Themes. Der Workflow speichert Ansichts- und Vergleichsbilder unter `ui-screenshots`.
- Sichtprüfung der erzeugten Galerie-Bilder: Desktop/Handy, helle/dunkle Themes, beide Plusbuttons, Auswahl, Regler, Wiederholungen, Programme und Kalender geprüft; keine Überläufe oder überdeckten Bedienelemente.
- Quellpriorität und Objektzuordnung: `docs/COMPONENTS.md`; exakte Quellidentitäten: `docs/PROVENANCE.json`.
- `preview.html` und `gallery.html` sind vollständig lokale interaktive Vorschauen. Ein separater Release-Tag für 1.2.0 wurde noch nicht angelegt.
- Die Prüfungen validieren den Baukasten mit Beispieldaten, keine produktive HA-Verbindung. Übernahmen in Anwendungen werden gesondert veröffentlicht und in `docs/ADOPTION.md` dokumentiert.
