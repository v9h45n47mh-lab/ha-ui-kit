import {UI_CSS, UI_VERSION, ICON_NAMES, icon, escapeHtml, button, iconButton, navigation, toggle, filterButton, section, row, field, selectField, dialog, notice, versionInfo, bindUI} from '../dist/family-ui.js';

/** Demo data is local; this card performs no Home Assistant service calls. */
class FamilyUIExampleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this.page = 'settings';
    this.enabled = true;
    this.filtered = false;
    this.name = 'Wohnbereich';
    this.folds = {};
  }
  setConfig(config) { this.config = config; }
  set hass(hass) { this._hass = hass; }
  getCardSize() { return 6; }
  connectedCallback() {
    this.unbind ||= bindUI(this.shadowRoot, event => this.onAction(event));
    this.render();
  }
  disconnectedCallback() { this.unbind?.(); this.unbind = null; }
  onAction({action, data, checked}) {
    if (action === 'navigate') { this.page = data.page; this.render(); }
    if (action === 'enabled') { this.enabled = checked; this.render(); }
    if (action === 'filter') { this.filtered = !this.filtered; this.render(); }
    if (action === 'edit' || action === 'add') {
      const modal = this.shadowRoot.querySelector('dialog');
      modal.querySelector('input').value = action === 'add' ? '' : this.name;
      modal.showModal();
    }
    if (action === 'cancel') this.shadowRoot.querySelector('dialog').close();
    if (action === 'save') {
      const input = this.shadowRoot.querySelector('dialog input');
      if (!input.reportValidity()) return;
      this.name = input.value;
      this.shadowRoot.querySelector('dialog').close();
      // Keep the opener mounted so native dialog focus restoration works.
      const title = this.shadowRoot.querySelector('[data-name]');
      if (title) title.textContent = this.name;
    }
    if (action === 'delete') {
      this.shadowRoot.querySelector('#feedback').innerHTML = notice('Beispielaktion: Eintrag löschen.');
    }
  }
  render() {
    for (const fold of this.shadowRoot.querySelectorAll('[data-ui="collapse"]')) {
      this.folds[fold.getAttribute('aria-controls')] = fold.getAttribute('aria-expanded') === 'true';
    }
    const block = props => section({...props, expanded:this.folds[props.id+'-content'] ?? true});
    const edit = iconButton({icon:'edit', label:'Bearbeiten', action:'edit'});
    const settings = block({id:'language',title:'Sprache',trailing:button({label:'Deutsch',action:'language'}),content:''})
      + block({id:'general',title:'Allgemein',content:row({title:'Automatik aktiv',description:'Gemeinsamer Schalter im kompakten Layout',trailing:toggle({label:'Automatik aktiv',action:'enabled',checked:this.enabled})})})
      + block({id:'devices',title:'Geräte',trailing:button({label:'Geräte auswählen',action:'add',variant:'primary'}),content:row({title:this.name,description:'Wohnzimmer',trailing:edit+iconButton({icon:'trash',label:'Löschen',action:'delete',danger:true})})+row({title:'Küche',description:'Erdgeschoss',trailing:edit})+row({title:'Gerät mit einem bewusst sehr langen Anzeigenamen für die mobile Ansicht',description:'Obergeschoss',trailing:edit})})
      + block({id:'status',title:'Aktueller Status',content:row({title:'Letzte Änderung',trailing:'<small>Heute, 08:30 Uhr</small>'})})
      + block({id:'backup',title:'Sicherung',content:'<div class="toolbar">'+button({label:'Sicherung erstellen',action:'export'})+button({label:'Sicherung wiederherstellen',action:'import'})+'</div>'});
    const overview = `<div class="page-actions">${filterButton({label:'Urlaub',action:'filter',selected:this.filtered})}${button({label:'Programm',icon:'add',action:'add',variant:'primary'})}</div>`
      + block({id:'program',title:'Wohnbereich · Wochentage',trailing:edit,content:row({title:'Mo · Di · Mi · Do · Fr',description:this.filtered?'Im Urlaub ausführbar':'07:00 Uhr · Sonnenaufgang',trailing:iconButton({icon:'copy',label:'Kopieren',action:'copy',desktopOnly:true})})});
    const help = `<p class="hint">Symbole, Farben und Abstände werden von allen angepassten Integrationen gemeinsam verwendet.</p><div class="icon-grid">${ICON_NAMES.map(name => `<div>${icon(name)}<small>${escapeHtml(name)}</small></div>`).join('')}</div>`;
    this.shadowRoot.innerHTML = `<style>${UI_CSS}.icon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:20px;margin:24px 0}.icon-grid>div{display:flex;align-items:center;gap:8px}</style><div class="ui-card">${navigation({label:'Beispielkarte',items:[{id:'overview',label:'Programme'},{id:'schedule',label:'Zeitprogramm',icon:'schedule'},{id:'sensors',label:'Sensorprogramme',icon:'sensors'}],active:this.page})}<main>${this.page==='settings'?settings:this.page==='help'?help:overview}<div id="feedback"></div>${versionInfo({frontend:'1.0.0',backend:'Beispieldaten',ui:UI_VERSION})}</main></div>${dialog({id:'edit-dialog',title:'Eintrag bearbeiten',content:`<div class="grid">${field({id:'name',label:'Name',value:this.name,required:true})}${selectField({id:'area',label:'Bereich',value:'living',options:[{value:'living',label:'Wohnzimmer'},{value:'kitchen',label:'Küche'}]})}</div>`,actions:button({label:'Abbrechen',action:'cancel'})+button({label:'Speichern',action:'save',variant:'primary'})})}`;
    // A dedicated node demonstrates safely updating arbitrary text without rerender.
    const name = this.shadowRoot.querySelector('#devices-content .row-text strong');
    if (name) name.dataset.name = '';
  }
}
if (!customElements.get('family-ui-example-card')) customElements.define('family-ui-example-card', FamilyUIExampleCard);
