import { icon } from './icons.js';
import { bindObjects } from './controllers.js';

/** Text/attribute escaping; content parameters explicitly accept trusted application markup. */
export function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function dataAttrs(data = {}) {
  return Object.entries(data).map(([key, value]) => {
    if (!/^[a-z][a-z0-9-]*$/.test(key)) throw new TypeError(`Invalid data attribute: ${key}`);
    return ` data-${key}="${escapeHtml(value)}"`;
  }).join('');
}

function actionAttrs(action, data) {
  if (Object.hasOwn(data || {}, 'action')) throw new TypeError('Use the action argument for data-action');
  return ` data-action="${escapeHtml(action)}"${dataAttrs(data)}`;
}

export function button({label, action, icon: name, variant = 'text', disabled = false, data = {}}) {
  if (!['text', 'primary', 'danger'].includes(variant)) throw new TypeError('Unknown button variant');
  return `<button type="button" class="${variant === 'text' ? '' : variant}"${actionAttrs(action, data)}${disabled ? ' disabled' : ''}>${name ? icon(name) : ''}<span>${escapeHtml(label)}</span></button>`;
}

/** Shutter Manager's text plus is intentional: do not substitute the generic add SVG. */
export function programAddButton({label = 'Programm', action = 'new-program', disabled = false, data = {}} = {}) {
  return `<button type="button" class="primary program-add"${actionAttrs(action, data)}${disabled ? ' disabled' : ''}>+ ${escapeHtml(label)}</button>`;
}

/** Controlled ordering: index/count refer to the sortable group, not the whole list. */
export function programOrderButtons({programId, index, count, action = 'move-program', disabled = false, desktopOnly = true, upLabel = 'Nach oben sortieren', downLabel = 'Nach unten sortieren'}) {
  if (typeof programId !== 'string' || !programId) throw new TypeError('Ordering requires a program ID');
  if (!Number.isInteger(index) || !Number.isInteger(count) || count < 1 || index < 0 || index >= count) throw new RangeError('Ordering requires 0 <= index < count');
  const control = (direction, label, glyph, atBoundary) => `<button type="button"${actionAttrs(action, {program:programId, direction})} title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"${disabled || atBoundary ? ' disabled' : ''}>${glyph}</button>`;
  return `<div class="program-order${desktopOnly ? ' desktop-only' : ''}">${control('up', upLabel, '↑', index === 0)}${control('down', downLabel, '↓', index === count - 1)}</div>`;
}

export function iconButton({icon: name, label, action, disabled = false, danger = false, data = {}, desktopOnly = false}) {
  if (!label) throw new TypeError('Icon buttons require a label');
  return `<button type="button" class="edit-button${danger ? ' danger' : ''}${desktopOnly ? ' desktop-only' : ''}"${actionAttrs(action, data)} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"${disabled ? ' disabled' : ''}>${icon(name)}</button>`;
}

export function navigation({label, items, active, settings = true, help = true, settingsLabel = 'Einstellungen', helpLabel = 'Anleitung'}) {
  const navButton = (item, cls = '') => `<button type="button" class="${cls}${item.id === active ? ' selected' : ''}"${actionAttrs('navigate', {page:item.id})} aria-current="${item.id === active ? 'page' : 'false'}"${item.icon ? ` aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}"` : ''}>${item.icon ? icon(item.icon) : escapeHtml(item.label)}</button>`;
  return `<div class="card-top"><nav aria-label="${escapeHtml(label)}">${items.map(item => navButton(item, item.icon ? 'icon-tab' : '')).join('')}</nav>${help ? navButton({id:'help', label:helpLabel, icon:'help'}, 'settings-button') : ''}${settings ? navButton({id:'settings', label:settingsLabel, icon:'settings'}, 'settings-button') : ''}</div>`;
}

export function toggle({label, action, checked = false, disabled = false, data = {}, iconOnly = false}) {
  return `<button type="button" class="toggle${checked ? ' on' : ''}${iconOnly ? ' icon-only' : ''}" role="switch" aria-checked="${Boolean(checked)}" aria-label="${escapeHtml(label)}"${actionAttrs(action, data)}${disabled ? ' disabled' : ''}><span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span>${escapeHtml(label)}</span></button>`;
}

export function filterButton({label, action, selected = false, data = {}}) {
  return `<button type="button" class="filter-button"${actionAttrs(action, data)} aria-pressed="${Boolean(selected)}">${escapeHtml(label)}</button>`;
}

/** id must be unique within the card's ShadowRoot. trailing/content are trusted markup. */
export function section({id, title, content = '', trailing = '', expanded = true}) {
  if (!id || /\s/.test(id)) throw new TypeError('Section requires a nonempty ID without whitespace');
  return `<section class="settings-group" data-settings="${escapeHtml(id)}"><div class="settings-heading-row"><button type="button" class="settings-fold" data-ui="collapse" aria-expanded="${Boolean(expanded)}" aria-controls="${escapeHtml(id)}-content">${icon('chevron', {expanded})}<span>${escapeHtml(title)}</span></button>${trailing}</div><div id="${escapeHtml(id)}-content"${expanded ? '' : ' hidden'}>${content}</div></section>`;
}

export function row({title, description = '', trailing = ''}) {
  return `<div class="setting-row"><div class="row-text"><strong>${escapeHtml(title)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ''}</div><div class="toolbar">${trailing}</div></div>`;
}

export function field({id, label, value = '', type = 'text', required = false, disabled = false, name, min, max, step, placeholder, maxLength, inputMode, autocomplete, unit = '', hint = '', error = ''}) {
  if (!['text','number','time','date','email','search','url'].includes(type)) throw new TypeError('Unsupported field type');
  const attrs = Object.entries({name,min,max,step,placeholder,maxlength:maxLength,inputmode:inputMode,autocomplete}).filter(([,v])=>v!==undefined).map(([k,v])=>` ${k}="${escapeHtml(v)}"`).join('');
  const described = [hint && id+'-hint',error && id+'-error'].filter(Boolean).join(' ');
  return `<label class="field" for="${escapeHtml(id)}"><span>${escapeHtml(label)}</span><input id="${escapeHtml(id)}" type="${type}" value="${escapeHtml(value)}"${attrs}${required ? ' required' : ''}${disabled ? ' disabled' : ''}${error ? ' aria-invalid="true"' : ''}${described ? ` aria-describedby="${escapeHtml(described)}"` : ''}>${unit?`<small class="field-unit">${escapeHtml(unit)}</small>`:''}${hint?`<small id="${escapeHtml(id)}-hint">${escapeHtml(hint)}</small>`:''}${error?`<small class="field-error" id="${escapeHtml(id)}-error" role="alert">${escapeHtml(error)}</small>`:''}</label>`;
}

export function selectField({id, label, value = '', options, disabled = false, name, required = false, hint = '', error = ''}) {
  const render = option => option.options ? `<optgroup label="${escapeHtml(option.label)}">${option.options.map(render).join('')}</optgroup>` : `<option value="${escapeHtml(option.value)}"${String(option.value) === String(value) ? ' selected' : ''}${option.disabled?' disabled':''}>${escapeHtml(option.label)}</option>`;
  return `<label class="field" for="${escapeHtml(id)}"><span>${escapeHtml(label)}</span><select id="${escapeHtml(id)}"${name?` name="${escapeHtml(name)}"`:''}${disabled ? ' disabled' : ''}${required?' required':''}${error?' aria-invalid="true"':''}${hint||error?` aria-describedby="${escapeHtml(id)}-help"`:''}>${options.map(render).join('')}</select>${hint||error?`<small id="${escapeHtml(id)}-help" class="${error?'field-error':''}"${error?' role="alert"':''}>${escapeHtml(error||hint)}</small>`:''}</label>`;
}

/** A native modal: call showModal() after inserting it. Escape and focus stay native. */
export function dialog({id, title, content, actions = '', closeLabel = 'Schließen'}) {
  return `<dialog id="${escapeHtml(id)}" class="modal" aria-labelledby="${escapeHtml(id)}-title"><div class="modal-head"><h3 id="${escapeHtml(id)}-title">${escapeHtml(title)}</h3><button type="button" class="edit-button" data-ui="close-dialog" aria-label="${escapeHtml(closeLabel)}" title="${escapeHtml(closeLabel)}">${icon('close')}</button></div><div class="modal-body">${content}</div><footer>${actions}</footer></dialog>`;
}

export function notice(message, {error = false} = {}) {
  return `<div class="${error ? 'error' : 'notice'}" role="${error ? 'alert' : 'status'}">${escapeHtml(message)}</div>`;
}

export function versionInfo({frontend, backend, ui, label = 'Oberfläche', backendLabel = 'Integration'}) {
  return `<p class="version-info">${escapeHtml(label)} ${escapeHtml(frontend)}${backend ? ` · ${escapeHtml(backendLabel)} ${escapeHtml(backend)}` : ''}${ui ? ` · UI ${escapeHtml(ui)}` : ''}</p>`;
}

/** Bind once per ShadowRoot; the returned function removes the listener on disconnect. */
export function bindUI(root, onAction = () => {}) {
  const unbindObjects = bindObjects(root, onAction);
  const handleClick = event => {
    const target = event.target.closest?.('button');
    if (!target || !root.contains(target) || target.disabled) return;
    if (target.dataset.ui === 'collapse') {
      const content = root.getElementById(target.getAttribute('aria-controls'));
      if (!content) return;
      const expanded = target.getAttribute('aria-expanded') !== 'true';
      target.setAttribute('aria-expanded', String(expanded));
      content.hidden = !expanded;
      target.querySelector('.chevron')?.classList.toggle('expanded', expanded);
      return;
    }
    if (target.dataset.ui === 'close-dialog') {
      target.closest('dialog')?.close();
      return;
    }
    if (!target.hasAttribute('data-action')) return;
    // Controlled components: the integration decides whether to commit the change.
    const checked = target.getAttribute('role') === 'switch' ? target.getAttribute('aria-checked') !== 'true' : undefined;
    onAction({action:target.dataset.action, data:{...target.dataset}, checked, element:target, originalEvent:event});
  };
  root.addEventListener('click', handleClick);
  const handleKeydown = event => {
    if (event.key !== 'Tab') return;
    const modal = event.target.closest?.('dialog[open]');
    if (!modal) return;
    const controls = [...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
  };
  root.addEventListener('keydown', handleKeydown);
  return () => { unbindObjects(); root.removeEventListener('click', handleClick); root.removeEventListener('keydown', handleKeydown); };
}
