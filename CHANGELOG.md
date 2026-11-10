# Changelog

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
