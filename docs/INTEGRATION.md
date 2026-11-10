# Integration in eine bestehende HA-Karte

## Dateien und Auslieferung

`scripts/vendor.mjs --target …/frontend` kopiert eine feste Version mit Lizenz und Manifest. Die Integration liefert den **gesamten** Frontendordner inklusive Unterverzeichnissen aus. Beispiel: Wenn die Kartenressource unter `/DOMAIN/card.js` liegt, muss auch `/DOMAIN/family-ui/1.1.0/family-ui.js` mit JavaScript-MIME-Type erreichbar sein. Nur eine einzelne registrierte JS-Datei reicht für den relativen Modulimport nicht. Die konkrete StaticPathConfig-Registrierung der jeweiligen Integration prüfen und bei der Umstellung anpassen.

Die JS-Datei enthält CSS und SVGs bereits vollständig. Die zusätzliche CSS-Datei muss nicht extra geladen werden. Es werden weder npm-Pakete noch weitere HA-Integrationen auf dem HA-System benötigt.

## Minimale Karte

```js
import {UI_CSS, UI_VERSION, navigation, section, row, iconButton, bindUI} from './family-ui/1.1.0/family-ui.js';

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

## Neue UI-Version übernehmen

1. Gewünschten Baukasten-Release auschecken, `npm run check` und `npm test` ausführen.
2. Kopierwerkzeug im Integrationsrepository ausführen. Alte Versionen werden nicht gelöscht. Geänderte Dateien derselben Version werden nicht still überschrieben.
3. Modulimport auf die neue Versionsadresse ändern. Unterschiedliche URL-Pfade verhindern, dass eine neue Karte versehentlich einen alten UI-Modulcache verwendet.
4. Karten-/Integrationsversion und Ressourcen-Cachekennung nach dem bestehenden Releaseverfahren erhöhen.
5. `vendor.mjs … --check`, Funktionsprüfungen und mobile Sichtprüfung durchführen. Eine veränderte Versionszeile allein zählt nicht als Umstellung.
6. Integration eigenständig veröffentlichen und `ADOPTION.md` mit der tatsächlich übernommenen Version aktualisieren.

Ein Rollback stellt die alte Integrationsversion samt Import und Lock-Datei wieder her. Alle benötigten Dateien liegen lokal bei der Integration.
