# Gemeinsamer Layoutstandard 1.4.1

Vorlage ist der veröffentlichte Shutter Manager 1.4.1. Gemeinsame Komponenten werden aus `dist/family-ui.js` verwendet. Die Implementierung ist in `src/` zentral gepflegt; generierte Dateien werden nicht von Hand geändert.

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

Ab 1.4.1 wird die Wertgruppe unabhängig von Hinweistexten exakt in der Kachelmitte ausgerichtet. Beide Kontostände stehen auf derselben Linie. Ein optionaler Fußhinweis ist einzeilig mit Ellipse, vollständigem Tooltip und unverändert zugänglichem Text.

## Musicplayer ab 1.4.1

`musicPlayerHeader`, `musicTransport`, `musicFavoriteTile`, `musicArtwork` und `musicActionButton` bilden den gemeinsamen Player. Zusätzlich zu `UI_CSS` wird unverändertes `MUSIC_PLAYER_CSS` innerhalb desselben ShadowRoot eingebunden. [Interaktives Beispiel](../examples/music-player.html).

Das Box-Dropdown steht links, ist 190 px breit und hat nur eine zugängliche, visuell versteckte Beschriftung; rechts steht das gemeinsame Zahnrad. Player-Tasten sind auch beim Hover kreisrund (48 × 48 px, Play/Pause 56 × 56 px). Favoritenkacheln zeigen ausschließlich Symbole oder Cover; `aria-label` und Tooltip erhalten den Namen. Schrift, Farben, Größen und Abstände stammen vollständig aus dem Kit. Der Host liefert Inhalte und entscheidet, welche Tasten und Einstellungen verfügbar sind.

`rangeControl({max:50, ...})` nutzt weiterhin die gesamte Reglerbreite: 0 links, 25 in der Mitte, 50 rechts. Die Obergrenze ist eine fachliche Entscheidung des Hosts. Musikdialoge übernehmen die vorhandene mobile Player-Anordnung zentral; normale Kit-Dialoge und bestehende Integrationen ändern sich nicht. Keine lokale CSS-Kopie oder Überschreibung dieser Komponenten verwenden.

Player-Kopf ab 1.4.1: `speakerSelect.compact:true` verwendet die gemeinsame 150-px-Variante für reine Raumnamen. `hideSpeaker:true` lässt ausschließlich das Zahnrad im Kopf stehen. Rechte und die Anzeige der Box in Einstellungen entscheidet weiterhin der Host.


## One-execution schedule controls (1.5.0)

Use `button({label:'Skip',icon:'skip-once',compact:true,action:'skip'})` for a narrow text/icon control. Compact buttons retain the shared font and theme colors, 16 px icons and a minimum 40 px touch target. Existing buttons keep their default geometry. Use `iconButton({icon:'reschedule',label:'Reschedule once',action:'reschedule'})` for the adjacent one-execution time control. The kit owns only markup and styling; applications validate dates, future times, ownership and execution rights.

Use actionRow({inlineActions:true}) when compact actions must stay side by side. The optional group prevents wrapping and shrinking; titles continue to wrap normally. Default action rows keep their existing behavior.

## Skipped schedule occurrences (1.5.2)

Use `actionRow({skipped:true,inlineActions:true})` for an omitted occurrence. The shared skipped state uses `--disabled-text-color` (fallback `#9e9e9e`) for text only; controls retain normal contrast. Omit redundant skip detail text and use `iconButton({icon:"restore-schedule",label:"Wieder einplanen",…})` instead of the skip icon. Do not change permissions or scheduling logic.

## Benutzerzeilen ab 1.6.0

`userAccessRow` übernimmt Zeilentypografie und Bedienelemente unverändert aus dem Kit. Desktop: Name links, Rollenauswahl bis 240 px und kompakter Schalter rechts. Mobil: Name/Schalter in einer Zeile, Rolle in der nächsten, mit einer gemeinsamen Trennlinie. Lange Namen und Rollen bleiben innerhalb der verfügbaren Breite; Administratorstatus überlappt den Namen nicht.


## Sortieren durch Ziehen ab 1.7.0

`orderHandle({id,index,count,action,group,disabled,label,data})` und `programOrderButtons` rendern einen Sortiergriff ohne Pfeilbuttons, auch mobil. `bindUI` bindet die Pointer-/Touch-/Tastatursteuerung automatisch ein. Den Griff etwa 180 ms halten, ziehen und loslassen; Escape oder eine veränderte Liste bricht ab. Am fokussierten Griff sortieren Pfeil auf/ab und Pos1/Ende ebenfalls.

Das kontrollierte Ereignis enthält `data.program`, `data.offset`, `data.fromIndex`, `data.toIndex` und weiterhin `data.direction`. Die Anwendung verschiebt per Entfernen/Einfügen, prüft ihre Rechte und speichert einmal. Keine Berechtigungs-, Speicher- oder Automationslogik im Kit. Bereiche mit gleicher Aktion/Gruppe bleiben getrennt von anderen Programmgruppen. Suchansichten oder während einer Speicherung gesperrte Griffe über `disabled` deaktivieren.


## Datumsgrenzen ab 1.7.1

`dateNavigation` unterstützt optional `previousDisabled`, `nextDisabled` und `todayDisabled`. Die vorhandene Option `disabled` sperrt weiterhin alle drei Aktionen. Beschriftungen und Aktionen bleiben vom Host wählbar; das Kit verändert keine Datums- oder Berechtigungslogik. Für Tagesansichten am heutigen Datum `nextDisabled:true` verwenden. Darstellung, Symbole, Schrift und Abstände bleiben unverändert.


## Messkacheln und Kopfaktionen ab 1.8.0

`accountTile({metrics:[{label,value,unit,description},…]})` zeigt bis zu zwei Messwerte in einer gemeinsamen, automatisch hohen Kachel. Ohne `metrics` bleiben bestehende quadratische Kontokacheln unverändert. Werte und Texte werden escaped; Berechnung und Formatierung erfolgen im Host.

`navigation({actions:[{icon:'refresh',label:'Aktualisieren',action:'reload',disabled:false}]})` ergänzt feste Kopfaktionen neben Hilfe und Einstellungen. Die bestehenden Reiter bleiben horizontal scrollbar. Das Kit enthält nur Darstellung und Ereignisse, keine Lade- oder Speicherlogik.


## Energy displays (1.9.0)

`energyFlow({nodes,flows,animated})` supplies PV/grid/home/battery circles and directed animated paths. The host supplies labels, values and source allocations; `energy-node` carries `data.node`. Battery is optional. `seriesChart({id,title,series,unit,kind,min,max,formatX,formatValue})` supports line and grouped bar charts. Each series has `label`, semantic `role` and `points:[{x,y}]`. Null values break lines. `bindSeriesCharts(root)` enables pointer, touch and keyboard inspection above the plot and returns cleanup. Use roles solar/grid/home/battery/export/charge, HA theme colours, local assets and reduced-motion support. No local style overrides. No calculations, recording, or service calls occur in these components.

`seriesChart` accepts optional `width` (280–1000 SVG units). Hosts should pass their current inner width to retain readable 12 px chart labels on mobile. The plot height stays 264 units; hit testing uses the supplied geometry. Initial inspectors show the most recent interval.

Since 1.9.2, bars are sized to the closest timestamps and placed within the plot. Signed data shows a zero baseline between positive and negative columns. The component keeps the supplied intervals and values at every width.
