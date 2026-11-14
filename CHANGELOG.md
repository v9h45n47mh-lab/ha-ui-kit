# Changelog

## 1.5.0 – 14.11.2026

- Added shared skip-once and reschedule icons for one-execution schedule controls.
- Added optional button({compact:true}) styling with a narrower icon/text layout and a minimum 40 px touch target; default controls are unchanged.
- Added unit and desktop/mobile light/dark browser coverage for icons, control dimensions, theme inheritance and keyboard actions.

## 1.4.1 – 11.11.2026

- Optionales `speakerSelect.compact` im gemeinsamen Player-Kopf: 150 px für Raumnamen bis „Schlafzimmer“. Die bestehende Standardbreite bleibt erhalten.
- `hideSpeaker` blendet die Box im Kopf aus, ohne das Zahnrad oder die Player-Steuerung zu verändern.
- Zusätzliche Browser- und API-Prüfungen für die kompakte Auswahl und ausgeblendete Box.

## 1.4.0 – 11.11.2026

- Gemeinsame Musicplayer-Bausteine: Kopfbereich mit linkem kompaktem Box-Dropdown ohne sichtbare Beschriftung und Zahnrad rechts, Medientasten, Cover und reine Symbolfavoriten.
- Kreisrunde Player-Tasten auch beim Hover, gemeinsame Medien-SVGs, unveränderte Grundkomponenten und zentraler Musikdialogstil.
- `selectField({hideLabel:true})` bewahrt die zugängliche Beschriftung.
- Eigenes Beispiel und Tests für Desktop/Handy, helle/dunkle Themes, lange Boxnamen und volle Reglerbreite bei frei vorgegebenem Maximum. Keine Berechtigungs-, Konto- oder Automationslogik.

## 1.3.1 – 2026-11-10

- Kontostände liegen unabhängig von optionalen Hinweisen auf derselben horizontalen Mittellinie. Name, Wert und Fußhinweis überlappen sich auch bei 320 px nicht.
- Optionale Hinweise stehen einzeilig am unteren Rand; der vollständige Text bleibt zugänglich.
- Browserprüfungen bestätigen tatsächliche helle/dunkle Themefarben und die identische Zentrierung beider Kacheln mit und ohne Hinweis.

## 1.3.0 – 2026-11-10

- Gemeinsame `accountTile`- und `accountTiles`-Komponenten ergänzt: quadratische Kontokacheln, Name oben links und großer, mittig ausgerichteter Kontostand mit Einheit und Status.
- Das Raster zeigt immer zwei gleich breite Kacheln nebeneinander, auch auf Mobilgeräten. Eine einzelne eigene Kachel belegt ebenfalls eine halbe Zeile.
- HA-Themefarben, semantische Kontozustände, optionale Hinweise, zugängliche Detailbeschreibung und escaped Textwerte. Keine Kontoberechnung, HA-Aufrufe oder Berechtigungslogik im Kit.
- Galerie sowie Unit- und Browserprüfungen für 1100/430/390/375/320 px, helle/dunkle Themes, quadratische Geometrie, halbe Breite, Zentrierung, lange Namen und Einzelkonten ergänzt.

## 1.2.2 – 2026-11-10

- Programmnamen und Zusatztexte beginnen jetzt bündig bei 28 px Einzug. Der doppelte 6-px-Iconabstand am Programmtitel entfällt zentral.
- Allgemeine Buttons behalten ihren Symbolabstand; Schriftgrößen, Bedienelemente und Ereignisse bleiben gleich.
- Browserprüfungen messen die Textausrichtung mit kurzen und langen Namen bei 320/390/1100 px in hellen und dunklen Themes.

## 1.2.1 – 2026-11-10

- Programmzeilen verwenden Schalter ohne sichtbaren doppelten Programmnamen. Die barrierefreie Beschriftung bleibt erhalten.
- `toggle({iconOnly:true})` ergänzt diese gemeinsame Variante auch für Aktionen und andere bereits beschriftete Zeilen.
- Lange Namen, 320/390/1100 px, helle/dunkle Themes, Tastatur und Schalterereignisse werden gesondert geprüft.

## 1.2.0 – 2026-11-10

- Den Katalog um sämtliche beim Repositoryvergleich ermittelten Objektfamilien erweitert. Herkunft nach der vorgegebenen Priorität Shutter, Light, Essensplaner, Haushalt, Spülmaschine, Access Manager dokumentiert; einzigartige Fotoobjekte aus Gartenarbeit ergänzt.
- Suchbare Einzel-/Mehrfachauswahl, Bereiche, gesperrte Einträge, Checkboxen/Wochentage, Zahlen mit Schnellwerten, Textbereiche, URL-Felder und gruppierte Dropdowns.
- Position/Prozent, unveränderte Werte, Kelvin und Farbrad; Zeitfenster, Saison, Datumsbereich und vollständiger Wiederholungseditor für die vorhandenen Haushaltsmuster.
- Programmgruppen/-zeilen, Aktionen und Editoren, Messwerte, Status/Zähler, Verlauf/Monatsgruppen, Statistiken, Wochenkalender und Tagesaufgaben mit Erledigungscheckboxen.
- Sprachwahl, Sicherungsimport/-export, Hilfe, Panel-Kopfbereich, Formularfehler, Leer-/Lade-/Speicherzustände, Bestätigung sowie Fotoauswahl, lokale JPEG-Verkleinerung, Vorschau und Großansicht.
- Optionale Wischgesten und Ziehen zum Aktualisieren mit Cleanup. Keine Übernahme von HA-Serviceaufrufen, Berechtigungsprüfungen oder Terminberechnung.
- Vollständige eigenständige Galerie ergänzt; sie zeigt ausdrücklich den gefüllten „+ Programm“-Button und den transparenten „+ Hausarbeit“-Button. Bestehende 1.1.0-APIs und hellblaue Sortierpfeile bleiben enthalten.
- Unit- und Browserprüfungen für Bedienung, Grenzfälle, Tastatur, Dateiimporte sowie Desktop/Mobil und helle/dunkle Themes ergänzt.

## 1.1.0 – 2026-11-10

- `programAddButton()` übernimmt das Textplus und den Primärbutton „+ Programm“ aus Shutter Manager.
- `programOrderButtons()` übernimmt ↑/↓, Maße und mobile Sichtbarkeit aus Shutter Manager; die Farbe folgt dem Nutzerwunsch nach hellblauen HA-Akzentpfeilen.
- Deaktivierte Pfeile an Gruppengrenzen, übersetzbare Beschriftungen und kontrollierte Aktionen mit Programm-ID/Richtung.
- Interaktive Beispielkarte und Browserprüfungen für Sortieren, Tastatur, Themes, Mobilansicht sowie Originalgeometrie ergänzt.

## 1.0.0 – 2026-11-10

- Gemeinsamer UI-Baukasten auf Basis Shutter Manager 1.4.0.
- Originalsymbole, HA-Theme-Farben, kompakte Navigation und Einstellungsabstände.
- Wiederverwendbare Bausteine für Aktionen, Zeilen, Bereiche, Schalter, Filter, Eingaben und Dialoge.
- Eigenständiges lokales Modul, versioniertes Kopierwerkzeug mit Integritätsprüfung, interaktive Beispielkarte und Integrationsanleitung.
- Tests für Desktop/Mobilansichten, Themes, Tastaturbedienung, Escaping und Versionsbindung.
