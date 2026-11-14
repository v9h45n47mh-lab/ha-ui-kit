# Integration in eine bestehende HA-Karte

## Dateien und Auslieferung

`scripts/vendor.mjs --target …/frontend` kopiert eine feste Version mit Lizenz und Manifest. Die Integration liefert den **gesamten** Frontendordner inklusive Unterverzeichnissen aus. Beispiel: Wenn die Kartenressource unter `/DOMAIN/card.js` liegt, muss auch `/DOMAIN/family-ui/1.2.2/family-ui.js` mit JavaScript-MIME-Type erreichbar sein. Nur eine einzelne registrierte JS-Datei reicht für den relativen Modulimport nicht. Die konkrete StaticPathConfig-Registrierung der jeweiligen Integration prüfen und bei der Umstellung anpassen.

Die JS-Datei enthält CSS und SVGs bereits vollständig. Die zusätzliche CSS-Datei muss nicht extra geladen werden. Es werden weder npm-Pakete noch weitere HA-Integrationen auf dem HA-System benötigt.

## Minimale Karte

```js
import {UI_CSS, UI_VERSION, navigation, section, row, iconButton, bindUI} from './family-ui/1.2.2/family-ui.js';

class ExampleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this.page = 'overview';
  }
  setConfig(config) { this.config = config; }
  set hass(hass) { this._hass = hass; /* Werte aktualisieren, offene Eingaben erhalten. */ }
  connectedCallback() {
    this.unbind ||= bindUI(this.shadowRoot, ({action, data}) => {
      if (action === 'navigate') { this.page = data.page; this.render(); }
      if (action === 'edit') this.openExistingEditor(data.id);
    });
    this.render();
  }
  disconnectedCallback() { this.unbind?.(); this.unbind = null; }
  openExistingEditor(id) { /* Vorhandenen fachlichen Editor für id öffnen. */ }
  render() {
    this.shadowRoot.innerHTML = `<style>${UI_CSS}</style><ha-card>
      ${navigation({label:'Beispiel',items:[{id:'overview',label:'Übersicht'}],active:this.page,help:false})}
      <main>${this.page === 'settings'
        ? section({id:'devices',title:'Geräte',content:row({title:'Wohnzimmer',trailing:iconButton({icon:'edit',label:'Bearbeiten',action:'edit',data:{id:'living'}})})})
        : '<p>Vorhandenen Inhalt hier einsetzen.</p>'}</main>
    </ha-card>`;
  }
}
customElements.define('example-card', ExampleCard);
```

Ein vollständiges lauffähiges Beispiel steht unter `examples/`. Bei produktiven Karten den bestehenden `ha-card`-Host und offene Editoren beibehalten, wenn dies für asynchrone HA-Slots, Scrollposition und Eingaben notwendig ist. Die minimale Karte veranschaulicht den Import, ersetzt keine vorhandene Zustandsverwaltung.

## Komponenten und Ereignisse

| Export | Zweck |
| --- | --- |
| `UI_CSS`, `UI_VERSION` | Gemeinsam erzeugte Stile und feste Layoutversion |
| `icon(name)` / `ICON_NAMES` | Zentrales SVG-Register; unbekannte Namen sind Fehler |
| `button`, `iconButton` | Text-/Primär-/Gefahrbutton oder beschrifteter Symbolbutton |
| `programAddButton` | Originaler „+ Programm“-Textbutton; Standardaktion `new-program` |
| `programOrderButtons` | Originale ↑/↓-Pfeile in Akzentfarbe; Standardaktion `move-program`, `data.program` und `data.direction` |
| `navigation` | Kopfzeile mit optionaler Hilfe und Einstellungen; Callback `navigate`, `data.page` |
| `section` | Einklappbarer Einstellungsbereich mit eindeutigem `id` und optionaler rechter Aktion |
| `row` | Kompakte Zeile mit Titel, Zusatztext und rechten Bedienelementen |
| `toggle` | Kontrollierter Schalter; Callback enthält vorgeschlagenen neuen Wert `checked` |
| `filterButton` | Kontrollierter Filter mit `aria-pressed` |
| `field`, `selectField` | Beschriftete native Eingabefelder |
| `dialog` | Native `<dialog>`-Struktur; mit `showModal()` öffnen |
| `notice`, `versionInfo` | Status-/Fehlermeldung und Versionszeile |
| `escapeHtml` | Escaping für Text-/Attributwerte in eigenem Markup |
| `bindUI(root, callback)` | Delegation für Aktionen; steuert Einklappen und Dialog-Schließen; gibt Cleanup-Funktion zurück |

Aktionen erhalten `{action, data, checked, element, originalEvent}`. Die Funktionen erzeugen `type="button"`. Native Tastaturbedienung funktioniert mit Enter/Leertaste. Der Baukasten sendet keine HA-Aufrufe. Schalter/Filter ändern ihren fachlichen Wert erst, wenn die Integration die Aktion verarbeitet hat; Fehler und fehlende Berechtigungen müssen dort behandelt werden.

`content`, `trailing` und `actions` akzeptieren **vertrauenswürdiges Markup aus dem eigenen Programmcode**. Nutzereingaben, Entitätsnamen und sonstige externe Werte immer als Textparameter übergeben oder mit `escapeHtml` escapen. `data`-Schlüssel erlauben nur einfache Kleinbuchstaben/Ziffern/Bindestriche; `data.action` ist reserviert.

Die eingebauten Bezeichnungen sind deutsch. `navigation` erlaubt `settingsLabel`/`helpLabel`, `dialog` erlaubt `closeLabel`, `versionInfo` erlaubt `label`/`backendLabel`. Alle fachlichen Bezeichnungen übersetzt die Integration selbst.

## Programm-Aktionen ab 1.1.0

```js
programAddButton(); // + Programm, keine separate SVG-Grafik
programAddButton({label:'Program',action:'new-program'}); // + Program
programOrderButtons({programId:program.id,index,count:group.programs.length});
```

`index` ist nullbasiert und bezieht sich wie `count` auf die tatsächlich sortierbare Gruppe. Am Anfang ist ↑ deaktiviert, am Ende ↓; bei einem einzelnen Eintrag sind beide deaktiviert. Mit `disabled:true` wird die gesamte Gruppe gesperrt. `desktopOnly` ist standardmäßig `true`, `upLabel`/`downLabel` erlauben übersetzte Beschriftungen. Beispiel für Englisch: `{upLabel:'Move up',downLabel:'Move down'}`.

`bindUI` reicht die Aktionen an die Integration durch. Die Integration prüft wie bisher Berechtigung und Zielposition, speichert die neue Reihenfolge und aktualisiert anschließend die Ansicht. Beispiel: `action === 'move-program'`, `data.program` als Programm-ID und `data.direction` als `up` oder `down`. Die mitgelieferte Beispielkarte zeigt diese kontrollierte Sortierung mit zwei lokalen Einträgen. Die Funktionslogik produktiver Integrationen bleibt deren Aufgabe.

Bei der Übernahme vorhandene „+ Programm“-Buttons und Sortierpfeile durch diese Funktionen ersetzen. Nur ein Update des Modulimports ersetzt individuell programmiertes Markup noch nicht.

## Zusätzliche Objekte ab 1.2.1

[COMPONENTS.md](COMPONENTS.md) enthält die vollständige Zuordnung von Exporten, Vorlagen, Parametern und Ereignissen. `gallery.html` zeigt alle Objektfamilien; `examples/gallery.js` enthält ihre gemeinsame Verwendung. `bindUI` aktiviert auch die neuen Bedienelemente. `bindObjects` ist nur für Hosts gedacht, die die allgemeinen Buttons separat behandeln; beide nicht gleichzeitig an denselben Root binden.

Neue Werte werden als `value` geliefert; komplexe Eingaben zusätzlich mit `valid`, Regler mit `phase: 'input' | 'change'`. Der Callback kann vor dem Speichern den vorhandenen Backend-Validator und die Berechtigungsprüfung aufrufen. Suche, Ausklappen und lokale Eingabe arbeiten unmittelbar im DOM; erst die Integration übernimmt den vorgeschlagenen fachlichen Wert. Beim Aktualisieren aus HA offene Eingaben bewahren und bei abgelehnten Änderungen den gespeicherten Wert wieder rendern.

Die beiden Plusbuttons sind eigenständige Varianten:

```js
programAddButton(); // gefüllt, originales Textplus: + Programm
button({label:'Hausarbeit',icon:'add',action:'new-task'}); // transparent, Plus-SVG
```

Sicherungen liefern geparstes JSON, noch kein geprüftes oder gespeichertes Integrationsschema. Fotoauswahl liefert ein lokal verkleinertes JPEG als Data-URL; Speicherung und Freigaben liegen beim Host. `confirmDialog` bestätigt nur eine UI-Aktion. Wisch-/Aktualisierungsgesten sind optional über `bindGestures` einzubinden und beim Entfernen separat zu lösen. Terminberechnung, Wiederholungsinstanzen, Statistiksummen und Datumsnavigation berechnet weiterhin die Integration.

## Neue UI-Version übernehmen

1. Gewünschten Baukasten-Release auschecken, `npm run check` und `npm test` ausführen.
2. Kopierwerkzeug im Integrationsrepository ausführen. Alte Versionen werden nicht gelöscht. Geänderte Dateien derselben Version werden nicht still überschrieben.
3. Modulimport auf die neue Versionsadresse ändern. Unterschiedliche URL-Pfade verhindern, dass eine neue Karte versehentlich einen alten UI-Modulcache verwendet.
4. Karten-/Integrationsversion und Ressourcen-Cachekennung nach dem bestehenden Releaseverfahren erhöhen.
5. `vendor.mjs … --check`, Funktionsprüfungen und mobile Sichtprüfung durchführen. Eine veränderte Versionszeile allein zählt nicht als Umstellung.
6. Integration eigenständig veröffentlichen und `ADOPTION.md` mit der tatsächlich übernommenen Version aktualisieren.

Ein Rollback stellt die alte Integrationsversion samt Import und Lock-Datei wieder her. Alle benötigten Dateien liegen lokal bei der Integration.

## Schalter ohne sichtbaren Doppeltext ab 1.2.1

`toggle({label, action, iconOnly:true})` zeigt nur den Schalter. Die Beschriftung bleibt als `aria-label` für assistive Technik erhalten. `programRow` verwendet diese Variante automatisch; normale beschriftete Schalter bleiben unverändert.

## Bündige Programmtexte ab 1.2.2

`programRow` richtet Programmnamen und Metadaten (Wochentage, Zeiten) bei 28 px Einzug aus. Der gemeinsame 8-px-Abstand zum 20-px-Aufklapppfeil genügt; der allgemeine zusätzliche Icon-Text-Abstand wird für den Programmtitel aufgehoben. Andere Buttons behalten ihren bisherigen Symbolabstand. Die Korrektur gilt für Desktop und Mobil, auch bei umbrochenen Namen.

Die neue feste Version mit `vendor.mjs` übernehmen und den lokalen Import auf `family-ui/1.2.2/family-ui.js` ändern. Anwendungen mit `programRow` benötigen keine eigene CSS-Korrektur. Funktionen, Ereignisse und gespeicherte Daten bleiben gleich.

## Kontokacheln ab 1.3.0

```js
import {accountTile,accountTiles} from "./family-ui/1.3.0/family-ui.js";
const accounts=accountTiles({content:accountTile({id:"account-max",label:"Maximilian",value:25,unit:"min",status:"Guthaben",state:"success"})});
```

Das feste Raster liefert zwei halbe Breiten, auch mobil. Keine lokale CSS-Kopie ergänzen. Konten, Einheiten, Vorzeichenbedeutung, Detailtexte und Berechtigungen bleiben in der Anwendung.

## Musicplayer ab 1.5.0

`musicPlayerHeader`, `musicTransport`, `musicFavoriteTile`, `musicArtwork` und `musicActionButton` bilden den gemeinsamen Player. Zusätzlich zu `UI_CSS` wird unverändertes `MUSIC_PLAYER_CSS` innerhalb desselben ShadowRoot eingebunden. [Interaktives Beispiel](../examples/music-player.html).

Das Box-Dropdown steht links, ist 190 px breit und hat nur eine zugängliche, visuell versteckte Beschriftung; rechts steht das gemeinsame Zahnrad. Player-Tasten sind auch beim Hover kreisrund (48 × 48 px, Play/Pause 56 × 56 px). Favoritenkacheln zeigen ausschließlich Symbole oder Cover; `aria-label` und Tooltip erhalten den Namen. Schrift, Farben, Größen und Abstände stammen vollständig aus dem Kit. Der Host liefert Inhalte und entscheidet, welche Tasten und Einstellungen verfügbar sind.

`rangeControl({max:50, ...})` nutzt weiterhin die gesamte Reglerbreite: 0 links, 25 in der Mitte, 50 rechts. Die Obergrenze ist eine fachliche Entscheidung des Hosts. Musikdialoge übernehmen die vorhandene mobile Player-Anordnung zentral; normale Kit-Dialoge und bestehende Integrationen ändern sich nicht. Keine lokale CSS-Kopie oder Überschreibung dieser Komponenten verwenden.

Player-Kopf ab 1.5.0: `speakerSelect.compact:true` verwendet die gemeinsame 150-px-Variante für reine Raumnamen. `hideSpeaker:true` lässt ausschließlich das Zahnrad im Kopf stehen. Rechte und die Anzeige der Box in Einstellungen entscheidet weiterhin der Host.


## One-execution schedule controls (1.5.0)

Use `button({label:'Skip',icon:'skip-once',compact:true,action:'skip'})` for a narrow text/icon control. Compact buttons retain the shared font and theme colors, 16 px icons and a minimum 40 px touch target. Existing buttons keep their default geometry. Use `iconButton({icon:'reschedule',label:'Reschedule once',action:'reschedule'})` for the adjacent one-execution time control. The kit owns only markup and styling; applications validate dates, future times, ownership and execution rights.
