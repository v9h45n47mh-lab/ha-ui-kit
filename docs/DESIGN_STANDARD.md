# Gemeinsamer Layoutstandard 1.3.1

Vorlage ist der veröffentlichte Shutter Manager 1.4.0. Gemeinsame Komponenten werden aus `dist/family-ui.js` verwendet. Die Implementierung ist in `src/` zentral gepflegt; generierte Dateien werden nicht von Hand geändert.

Für zusätzliche Objekte gilt die Quellenpriorität **Shutter → Light → Essensplaner → Haushalt → Spülmaschine → Access Manager**. Einmalige Objekte stammen aus ihrer ursprünglichen Implementierung. Der [Bausteinkatalog](COMPONENTS.md) ordnet jedes Objekt seiner Vorlage zu; die Quellstände sind in [PROVENANCE.json](PROVENANCE.json) festgehalten. Abweichende Varianten niedrigerer Priorität werden als Option desselben Bausteins angeboten, sofern sie eine vorhandene Funktion benötigen. Gemeinsame Theme-Werte gelten auch für die zusätzlichen Objekte.

| Element | Verbindliche Vorgabe |
| --- | --- |
| Schrift | HA-Schrift `--ha-font-family-body`, ersatzweise Roboto/Arial/sans-serif; Grundgröße 14 px |
| Akzent | `--primary-color`, ersatzweise `#03a9f4` |
| Haupttext / Nebentext | HA-Variablen; Ersatzwerte `#212121` / `#727272` |
| Einstellungen | Original-Zahnrad aus Shutter Manager; 24 px; inaktiv Nebentextfarbe; ausgewählt Akzentfarbe und 8 % Akzenthintergrund |
| Bearbeiten / Löschen / Kopieren | Original-SVGs; 20 px in einer mindestens 40 × 40 px großen Schaltfläche |
| Löschen | `--error-color`, ersatzweise `#db4437` |
| Navigation | Links Inhalt, rechts Hilfe und Einstellungen; Höhe mindestens 52 px, mobil 48 px |
| Hauptinhalt | Desktop `8px 16px 16px`, mobil `4px 12px 12px` |
| Einstellungsbereiche | Vertikal 10 px; Überschrift 14 px, Gewicht 500; Chevron 20 px |
| Einstellungszeilen | Mindestens 40 px, vertikal 4 px Innenabstand; Name 13 px, Zusatztext 12 px |
| Schalter | Spur 36 × 20 px, Knopf 16 px; mindestens 40 px hohe Bedienfläche |
| Buttons | HA-Rundung, ersatzweise 20 px; Standardinnenabstand `9px 14px` |
| + Programm | `programAddButton()`; Textplus wie im Shutter Manager, kein separates SVG; 13 px, Primärbutton |
| + Hausarbeit | `button({label:'Hausarbeit',icon:'add',…})`; transparenter Textbutton mit Plus-SVG in HA-Akzentfarbe |
| Programmtext und Zusatztext | Beide beginnen 28 px rechts vom linken Programmrand: 20 px Aufklapppfeil + 8 px Abstand. Der Programmname erhält keinen zusätzlichen Icon-Text-Abstand. Gilt auch mobil und bei mehrzeiligen Namen. |
| Sortierpfeile | `programOrderButtons()`; Textzeichen ↑ / ↓ wie im Shutter Manager; 18 px, Buttons 30 × 34 px, Padding 4 px, Abstand 0; HA-Akzentfarbe, standardmäßig Hellblau `#03a9f4`; deaktiviert mit 45 % Deckkraft |
| Eingaben | 4 px Rundung, Innenabstand `11px 10px`; HA-Text-, Eingabe- und Trennfarben |
| Dialoge | Maximal 800 px breit; native Modalität, Escape, Fokusbegrenzung und Fokuswiederherstellung; mobil maximal 96 dvh |
| Mobil | Bis einschließlich 600 px; Formularspalten untereinander; lange Namen umbrechen |
| Optionale Desktopaktionen | `desktopOnly` blendet die betreffende Aktion mobil aus; Entscheidung je fachlichem Ablauf |
| Versionszeile | 12 px Nebentextfarbe; Oberfläche, Integration und UI-Version |

Originalpfade sind für `settings`, `help`, `edit`, `trash`, `copy`, `move`, `schedule`, `sensors`, `sunrise`, `sunset`, `lock`, `unlock`, `temperature`, `illuminance`, `success`, `failure` und `unknown` enthalten. `chevron` entspricht dem Original-Faltpfeil. `add`, `close`, `save`, `up`, `down`, `left`, `right` und `menu` ergänzen den gleichen Strichstil. Keine Emoji- oder Textzeichen als Ersatz für diese gemeinsamen Aktionssymbole verwenden. Die Sprachwahl verwendet wie ihre Shutter-Vorlage Landesflaggen zusätzlich zu den Textkürzeln DE/EN.

Die Programmbausteine sind die ausdrückliche Ausnahme: Sie verwenden die originalen Textzeichen `+`, `↑` und `↓`. `icon('add')` sowie die generischen SVG-Chevrons `icon('up')`/`icon('down')` bleiben für andere Anwendungsfälle erhalten und werden nicht für diese Programmbausteine verwendet. Die Sortierpfeile haben auf ausdrücklichen Nutzerwunsch die Akzentfarbe statt der sekundären Textfarbe der Vorlage. Erster/letzter Eintrag deaktivieren den jeweils nicht möglichen Pfeil; standardmäßig wird die Sortiergruppe bis 600 px ausgeblendet.

## Regeln für neue und angepasste Karten

1. Gemeinsame Teile über die exportierten Funktionen und `UI_CSS` einbinden. Je Karten-ShadowRoot einmal `bindUI` verwenden und beim Entfernen wieder lösen.
2. Fachliche Anordnung kann je Integration variieren. Gemeinsame Symbole, Farben und Grundabstände dürfen nicht durch lokale Kopien oder CSS-Überschreibungen auseinanderlaufen.
3. HA-Theme-Werte erben. Farbauswahl für einzelne Karten nur über das HA-Theme ändern, sofern der Nutzer keine ausdrückliche Ausnahme verlangt.
4. Neue gemeinsame Komponenten zuerst im Baukasten ergänzen. Releaseversion, Prüfsummen und Beispielkarte gemeinsam aktualisieren.
5. Vor einer Übernahme Berechtigungen, Serviceaufrufe und bestehende Formulare prüfen. Der UI-Baukasten entscheidet keine Berechtigung und ändert keine Automationslogik.

Die kompakte Darstellung ist bewusst an die Vorlage angelehnt. Dialoge verwenden native Browserfunktionen für zuverlässige Tastaturbedienung. Das ist eine gezielte technische Verbesserung gegenüber dem ursprünglichen Overlay bei gleichen Farben, Schriften und Innenabständen.

## Kontokacheln ab 1.3.0

`accountTiles` verwendet immer zwei gleich breite Spalten, auch bei 320 px und bei nur einem sichtbaren Konto. `accountTile` ist quadratisch; der Name steht oben links, der Zahlenwert groß und mittig mit Einheit/Status darunter. Standardabstand und Innenabstand betragen 16 px, bis 600 px jeweils 12 px. Der Host bestimmt Wert und Bedeutung; das Kit stellt nur die angegebenen semantischen Zustände dar. Optionale Details sind als vollständiger Tooltip und zugängliche Beschreibung verfügbar. Keine lokale Gestaltungskopie pro Integration.

Ab 1.3.1 wird die Wertgruppe unabhängig von Hinweistexten exakt in der Kachelmitte ausgerichtet. Beide Kontostände stehen auf derselben Linie. Ein optionaler Fußhinweis ist einzeilig mit Ellipse, vollständigem Tooltip und unverändert zugänglichem Text.
