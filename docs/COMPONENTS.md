# Bausteinkatalog 1.2.2

Die Galerie `gallery.html` zeigt alle Objektfamilien interaktiv und ohne Server; `examples/gallery.html` verwendet dasselbe Modul wie eine Integration. Das kompakte Programmbeispiel bleibt in `preview.html` verfügbar.

## Auswahl der Vorlagen

Verbindliche Priorität bei mehreren Implementierungen: **Shutter → Light → Essensplaner → Haushalt → Spülmaschine → Access Manager**. Einmalige Objekte werden aus ihrer jeweiligen Implementierung übernommen. Deshalb stammen beispielsweise Farbrad und Kelvinregler aus Light, die Gerichte-Suche aus Essensplaner, Wiederholungen aus Haushalt und Fotos aus Gartenarbeit. Gemeinsame Buttons, Eingabefelder, Symbole und HA-Farben folgen weiterhin dem Shutter-basierten Grundsystem.

Bei Überschneidungen gibt es einen gemeinsamen Standard. Funktional notwendige Ergänzungen der nachgeordneten Vorlage sind Optionen desselben Bausteins: beispielsweise Bereichsgruppen und `selectedFirst` für die Shutter-Mehrfachauswahl aus Light. Aus dem Access-Kopfbereich stammt die 64-px-Struktur; Farben werden über die gemeinsamen HA-Variablen gesetzt. Die Sortierpfeile verwenden auf ausdrücklichen Wunsch Hellblau statt der sekundären Textfarbe der Shutter-Vorlage. Exakte Quellpfade und Blob-Identitäten stehen in [PROVENANCE.json](PROVENANCE.json).

## Vollständige Zuordnung

| UI-Objekt | Export / Variante | Gewählte Vorlage |
| --- | --- | --- |
| Text-, Primär-, Gefahr- und Symbolbuttons | `button`, `iconButton` | Shutter / vorhandener Grundbaukasten |
| Gefülltes „+ Programm“ | `programAddButton` | Shutter, Textplus |
| Transparentes „+ Hausarbeit“ | `button({label:'Hausarbeit',icon:'add',action:…})` | Haushaltsanwendung auf gemeinsamem Buttonstil |
| Sortierpfeile, Rand-/Sperrzustände | `programOrderButtons` | Shutter, Hellblau wie beauftragt |
| Navigation, Einstellungen, Hilfe, Bereich, Zeile | `navigation`, `section`, `row` | Shutter |
| Schalter und Filter | `toggle`, `filterButton` | Shutter |
| Text-, Zeit-, Datums-, URL- und native Auswahlfelder | `field`, `selectField` | Shutter-Grundfelder, vorhandene Feldtypen zusammengeführt |
| Zahlenfeld, Einheit, Grenzen und Schnellwerte | `numberControl` | Shutter, u. a. Zeitversatz |
| Mehrzeiliger Text, Hinweis und Feldfehler | `textareaField` | Essensplaner |
| Dropdown-Gruppen, deaktivierte Optionen | `selectField({options:[{label,options:…}]})` | Light-Szenenauswahl |
| Durchsuchbare Einzelauswahl, sechs sichtbare Treffer | `combobox` | Essensplaner |
| Geräte-/Entitätsauswahl, Suche, alle/keine, gesperrte Werte | `multiSelect` | Shutter |
| Bereichsgruppen, ausgewählte Einträge zuerst | `multiSelect` mit `group` / `selectedFirst` | Light-Erweiterung desselben Bausteins |
| Checkboxgruppen und Wochentagschips | `checkboxGroup`, `weekdayPicker` | Shutter |
| Prozent-/Positions-/Lamellenregler, unveränderter Wert | `rangeControl` | Shutter |
| Helligkeit mit letzter Einstellung | `rangeControl` mit `value:null` / `keepLabel` | Shutter-Regler, Light-Option |
| Kelvinregler, Kaltweiß → Warmweiß | `whiteTemperatureControl` | Light |
| Farbrad, Marker, Vorschau und RGB/HEX-Wert | `colourPicker` | Light |
| Zeitfenster, auch über Mitternacht | `timeWindow` | Shutter |
| Saison ohne Jahreszahl | `seasonPicker` | Shutter |
| Start-/Enddatum | `dateRange` | Shutter |
| Einmalig, täglich, wöchentlich, monatlich, jährlich | `recurrenceEditor` | Haushalt |
| Monatstag / n-ter oder letzter Wochentag | `recurrenceEditor` | Haushalt |
| Abwechselnde Personen und Startperson | `recurrenceEditor` mit `people` | Haushalt |
| Programmgruppe, Programm, Metadaten, Schalter und Aktionen | `programGroup`, `programRow` | Shutter |
| Fahrt-/Schaltaktionszeile und aufklappbarer Aktionseditor | `actionRow`, `actionEditor` | Shutter |
| Alle Bereiche auf-/zuklappen | `foldControls` | Shutter |
| Sonnenzeiten und gruppierte Sensorwerte | `sensorOverview` | Shutter |
| Aktiv-/Pausiert-/Erfolgs-/Fehlerstatus | `statusBadge` | Light, gemeinsamer Inline-Tag |
| Anzahlen | `counter` | Shutter |
| Befehlsverlauf mit Ergebnis und Fehlergrund | `historyList` | Shutter |
| Aufklappbare Monatsgruppen | `groupedHistory` | Spülmaschine, gemeinsame Verlaufszeilen |
| Statistiktabelle mit Summenzeile | `statisticsTable` | Spülmaschine |
| Vor-/Zurück-/Heute-Navigation und Wochenkalender | `dateNavigation`, `weekCalendar` | Essensplaner |
| Tagesaufgaben und Erledigung je Person | `dayAgenda`, `completionRow` | Haushalt |
| Sprachauswahl mit DE/EN und Flaggen | `languagePicker` | Shutter |
| JSON-Sicherung: Auswahl, Import, Export | `backupControls`, `readJSONFile`, `downloadJSON` | Shutter |
| Hilfeseite mit Überschriften, Listen und Tabellen | `helpContent` | Shutter |
| Panel-Kopf mit Menü, Titel, Laden und Speichern | `panelHeader` | Access Manager |
| Hinweis, Erfolg, Warnung, Fehler | `feedback`, vorhandenes `notice` | Shutter-Grunddarstellung, zusätzliche Zustände in HA-Farben |
| Formularfehler, Leer-/Ladezustände, laufendes Speichern | `formError`, `emptyState`, `loadingState`, `busyButton` | Shutter |
| Modaler Dialog und explizite Bestätigung | `dialog`, `confirmDialog` | Shutter-Grunddarstellung, native Dialogbedienung |
| Foto wählen/entfernen, Vorschau, Großansicht | `photoPicker`, `photoPreview`, `photoDialog` | Gartenarbeit |
| Lokale Fotokomprimierung | `compressPhoto` | Gartenarbeit |
| Horizontal wischen / nach unten ziehen | `bindGestures` | Essensplaner / Gartenarbeit |

## Einbindung und Datenvertrag

Alle Renderfunktionen liefern HTML. Ein `id` muss im ShadowRoot eindeutig sein und darf keine Leerzeichen enthalten. Texte, Werte, Optionen und Datenattribute werden escaped. `content`, `actions`, `trailing`, `actionContent` sowie Inhalte einer Tagesgruppe sind **vertrauenswürdiges HTML aus dem Anwendungscode**. Entitätsnamen und Benutzertexte nicht ungeprüft dort interpolieren.

```js
import {UI_CSS,programAddButton,button,combobox,bindUI} from './family-ui/1.2.2/family-ui.js';

root.innerHTML = `<style>${UI_CSS}</style>
  ${programAddButton()}
  ${button({label:'Hausarbeit',icon:'add',action:'new-task'})}
  ${combobox({id:'recipe',label:'Gericht',items:recipes,action:'choose-recipe'})}`;
const unbind = bindUI(root, event => {
  if (event.action === 'choose-recipe') selectRecipe(event.value);
});
// disconnectedCallback: unbind();
```

`bindUI` bindet sämtliche Objektbedienung mit. Einmal pro ShadowRoot verwenden und die Cleanup-Funktion beim Entfernen aufrufen. Der exportierte niedrigere `bindObjects`-Binder wird nur benötigt, wenn eine vorhandene Karte die allgemeinen Buttonaktionen selbst delegiert; nicht zusätzlich zu `bindUI` verwenden. Neu eingefügtes Markup wird automatisch initialisiert.

Aktionen liefern `{action,data,element,originalEvent}` sowie abhängig vom Objekt `value`, `checked`, `valid`, `phase`, `label`, `hex`, `date` oder `file`. Die Standardaktionen können über den jeweiligen `action`-Parameter geändert werden. Buttons liefern wie bisher zusätzliche `data`-Attribute; Switches liefern `checked`. Die Integration führt Berechtigungsprüfungen und HA-Aufrufe aus und entscheidet, ob der vorgeschlagene Wert übernommen wird.

### Auswahl und Formulare

- `combobox({id,label,items,value,selected,action,…})`: `items` mit `{id|value,label,description?,disabled?}`; `value` ist der angezeigte Text, `selected` die ausgewählte ID. Teilstrings werden ohne Beachtung der Großschreibung gefiltert. Pfeiltasten/Enter wählen, Escape schließt zuerst die Trefferliste. Auswahl liefert `value` als ID und `label`. Freie Texteingabe allein wählt keine ID aus.
- `multiSelect({id,items,values,selectedFirst:false,…})`: `items` zusätzlich mit `group`, `hint`. Standardreihenfolge folgt der Vorlage; Bereichsgruppen und ausgewählte Einträge zuerst sind optional. „Alle“ wählt sichtbare, freigegebene Treffer; „keine“ entfernt alle freigegebenen Häkchen. Deaktivierte bestehende Auswahlen bleiben erhalten. Ereignis `selection-change` liefert die aktuelle ID-Liste.
- `checkboxGroup` verwendet denselben Item-/Wertevertrag ohne Suchliste. `weekdayPicker` liefert Zahlen `0…6` für Mo…So; Standardaktion `weekdays-change`.
- `numberControl` unterstützt `min`, `max`, `step`, `unit`, `required`, `disabled` und `presets` als Zahlen oder `{value,label}`. `number-change` liefert eine Zahl und `valid`; ein leeres/ungültiges Zahlenfeld kann `NaN` liefern und darf dann nicht gespeichert werden.
- `field`, `selectField`, `textareaField` verwenden native Formularwerte und -validierung; sie senden für sich allein keine fachliche Aktion. `hint`/`error` erzeugen zugeordnete Hinweise. `selectField.options` unterstützt verschachtelte `{label,options:[…]}`-Gruppen und gesperrte Optionen.

### Regler und Farben

- `rangeControl({id,label,value,min:0,max:100,step:1,unit:'%',allowKeep:true,keepLabel:'Unverändert',reverse:false,…})` begrenzt Werte auf den gültigen Bereich. `null` repräsentiert die unveränderte Einstellung. Ereignis `range-change` liefert Zahl oder `null`; Ziehen/Tastatur liefert `phase:'input'`, Abschluss `phase:'change'`. Die Integration entscheidet, ob sie nur bei Abschluss speichert.
- `whiteTemperatureControl` setzt Kelvin, Standardgrenzen 2000…6500. Höhere Werte stehen links (kalt), niedrigere rechts (warm). Grenzen sind pro Leuchte anpassbar; Ereignis `temperature-change` liefert den echten Kelvinwert.
- `colourPicker` akzeptiert `#RRGGBB` oder `[r,g,b]`. Maus/Touch bewegen den Marker, Pfeiltasten ändern die Position, Umschalt vergrößert den Schritt, Pos1 wählt Weiß. `colour-change` liefert RGB und `hex`. Hilfen `parseColour`, `rgbToHSV`, `hsvToRGB` sind ebenfalls exportiert. Helligkeit ist ein separater Regler.

### Zeiten und Wiederholungen

- `timeWindow` liefert `{start,end}` als `HH:MM` und `valid`. Gleiche Werte bedeuten ganztägig, das Ende darf vor dem Start liegen (über Mitternacht).
- `seasonPicker` nimmt `MM-DD` entgegen, zeigt `TT.MM.` und liefert `{enabled,start,end}` mit `MM-DD` oder bei fehlerhafter Eingabe `null`. `valid` berücksichtigt echte Kalendertage einschließlich 29. Februar; Jahreswechsel ist zulässig. `parseMonthDay` kann separat verwendet werden.
- `dateRange` liefert `{start,end}` als `YYYY-MM-DD`; `optionalEnd:true` erlaubt ein leeres Ende. Das Ende muss bei aktivem Wert mindestens dem Start entsprechen.
- `recurrenceEditor` verwendet `{kind,interval,start,end,weekdays,nth,alternating,first_person}`. `kind`: `once`, `daily`, `weekly`, `monthly_date`, `monthly_nth`, `yearly`; `weekdays` Mo=0; `nth` 1…5 oder -1 für „letzter“. `people` aktiviert die optionale Auswahl der Startperson. `recurrence-change` liefert das Muster und `valid`, `recurrenceSummary` den deutschen Kurztext. Die Integration berechnet Termine und behandelt Monate ohne den gewählten Tag. Der Editor führt keine Aufgabenrotation aus.

### Listen, Kalender und Programme

- `programGroup` und `programRow` erhalten `id`, Titel, `expanded`, `content`; `programRow` zusätzlich `meta`, `enabled`, `index`, `count`, `editable`, `sortable`, `copyable`, `disabled`. Aktionen: `program-enabled` mit `checked`, `copy-program`, `edit-program`, `move-program` mit `data.program` und ggf. `data.direction`. Weitere Aktionen als eigenes `actions`-Markup. Sortieren/Kopieren werden standardmäßig mobil ausgeblendet. Die Integration bestimmt, wer diese Aktionen sehen und ausführen darf.
- `actionRow` nimmt `title`, `description`, `detail`, `actions`, `enabled`; `actionEditor` kapselt Inhalt und Aktionsleiste mit Kurztext. `foldControls({scopeId})` klappt alle gemeinsamen Bereiche innerhalb dieses Containers auf/zu.
- `sensorOverview` zeigt Sonnenzeiten und `{title,items:[{label,value,icon}]}`-Gruppen. Werte werden fertig formatiert geliefert; es werden keine Sensoren abgefragt.
- `historyList.entries`: `{time,datetime?,title,description,detail?,status,result?}`; Status `success`, `error`, `pending`. `groupedHistory.groups`: `{title,entries,expanded?}`. `statisticsTable` erhält `{columns:[{label,align?}],rows,totals?}`. Gruppierung und Summen liefert der Host.
- `dateNavigation` sendet `previous-period`, `next-period`, `today`; `weekCalendar` erhält Startdatum und Einträge `{date,title,description,link?,actions?}`. Zeilenklick liefert `open-day` mit `value`/`date`; der Standard-Aktionsbutton liefert dasselbe Datum in `data.date`. HTTP(S)-Links sind zulässig. `calendarDates`/`dateKey` helfen bei lokaler Datumsformatierung, die Integration entscheidet über den angezeigten Zeitraum.
- `completionRow` erhält `{id,title,description,people:[{id,label,completed,disabled?}],readOnly}`. `completion-change` liefert `value`/`checked` sowie `data.id` und `data.person`. `dayAgenda` gruppiert fertigen Inhalt nach Tagen. Häkchen sind lokale Eingaben; Berechtigung, Speicherung und endgültiger Erledigungszustand kommen aus der Integration.

### Einstellungen, Dateien und Dialoge

- `languagePicker` liefert `language-change` mit `data.language`; `value` setzt die aktive Sprache. DE/EN sind Standard; `languages` kann ersetzt werden. Übersetzungen und Speichern übernimmt die Integration.
- `backupControls` bietet `export-backup` und `import-backup`; letzteres liefert JSON als `value` und die Quelldatei als `file`. Standardlimit 2 MiB. `readJSONFile` prüft Größe und JSON-Syntax; das Integrationsschema validiert der Host. `downloadJSON(value,{filename})` exportiert lokal, ohne Netzwerkzugriff.
- `photoPicker` liefert `photo-change` mit einer JPEG-Data-URL, beim Entfernen `null`. `compressPhoto` akzeptiert JPG/PNG/WebP bis 20 MiB, verkleinert die längste Seite auf höchstens 1600 px und reduziert JPEG-Qualität, bis die Data-URL unter 950000 Zeichen liegt. SVG und externe Bild-URLs sind nicht zugelassen. `photoPreview` und `photoDialog` akzeptieren JPEG-/PNG-/WebP-Data-URLs. Dateien werden weder hochgeladen noch gespeichert.
- `dialog`/`confirmDialog` werden vom Host mit `showModal()` geöffnet. Schließen und Abbrechen schließen den Dialog; Bestätigen liefert die konfigurierte Aktion, die Integration schließt nach Erfolg. Ein Klick auf Bestätigen allein löscht nichts. `busyButton` und `panelHeader` erhalten `busy`/`dirty` vom Host.
- `feedback` kennt `info`, `success`, `warning`, `error`; Fehler verwenden `role=alert`. `formError`, `emptyState`, `loadingState` und `helpContent` bieten die zugehörige Darstellung. `notice` bleibt für bestehende Karten verfügbar.

### Optionale Gesten

`bindGestures(surface,{onSwipeLeft,onSwipeRight,onPullDown,canPull,swipeThreshold:60,pullThreshold:85})` bindet Gesten ausschließlich an die angegebene Fläche und gibt eine eigene Cleanup-Funktion zurück. Eingabefelder, Links, Buttons, Farbrad und Mehrfingergesten sind ausgenommen. Für Ziehen zum Aktualisieren prüft der Standard den Dokumentanfang und offene Dialoge; Karten in eigenen Scrollcontainern geben eine passende `canPull`-Funktion an. Der Host führt Aktualisierung oder Zeitraumwechsel aus.

## Übernahme in Anwendungen

Die bisherigen APIs sind weiterhin verfügbar. Eine neue Versionsbindung allein ersetzt keine individuellen Formulare oder Listen: Integrationen müssen die entsprechenden Renderfunktionen verwenden und Ereignisse mit ihrer vorhandenen Logik verbinden. Der Auftrag erweitert ausschließlich den zentralen Baukasten. Bereits veröffentlichte Integrationsstände bleiben in [ADOPTION.md](ADOPTION.md) dokumentiert.

## Kontokacheln ab 1.3.0

| Objekt | API | Herkunft |
| --- | --- | --- |
| Quadratische Kontokachel | `accountTile({id,label,value,unit,status,state,description,details})` | Ausdrückliche neue Gartenarbeit-Vorgabe vom 10.11.2026 |
| Zwei gleich breite Kacheln pro Zeile | `accountTiles({content,label})` | Gartenarbeit; auch mobil zweispaltig |

`state` erlaubt `neutral`, `active`, `success`, `warning`, `error`. Der Host liefert alle Texte und Werte; das Kit rechnet keine Konten und sendet keine Dienste. `description` ist ein optionaler sichtbarer Hinweis, `details` eine vollständige zugängliche Beschreibung und ein Tooltip. `content` enthält vertrauenswürdiges Markup aus `accountTile`. Alle Textparameter werden escaped. Eine einzelne Kachel bleibt halbbreit.
