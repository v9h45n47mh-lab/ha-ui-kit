// Source paths: Shutter Manager 1.4.0. See docs/PROVENANCE.json.
const ICON_PATHS = Object.freeze({
  "sunrise": "<path d=\"M2 17h20M5 21h14M7 17a5 5 0 0 1 10 0M4 12l-2-2m18 2 2-2M12 9V2m-3 3 3-3 3 3\"/>",
  "sunset": "<path d=\"M2 17h20M5 21h14M7 17a5 5 0 0 1 10 0M4 12l-2-2m18 2 2-2M12 2v7m-3-3 3 3 3-3\"/>",
  "lock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 0 1 8 0v4m-4 5v2\"/>",
  "unlock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 0 1 7.5-2M12 15v2\"/>",
  "temperature": "<path d=\"M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0M12 8v10\"/><circle cx=\"12\" cy=\"18\" r=\"1\"/>",
  "illuminance": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5\"/>",
  "schedule": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 6v6l4 2\"/>",
  "sensors": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M6.3 6.3a8 8 0 0 0 0 11.4m11.4-11.4a8 8 0 0 1 0 11.4M3.5 3.5a12 12 0 0 0 0 17m17-17a12 12 0 0 1 0 17\"/>",
  "success": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m7 12 3 3 7-7\"/>",
  "failure": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v6m0 4h.01\"/>",
  "trash": "<path d=\"M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6\"/>",
  "move": "<path d=\"M14 4H4v16h10M10 12h12m-4-4 4 4-4 4\"/>",
  "copy": "<rect x=\"8\" y=\"8\" width=\"13\" height=\"13\" rx=\"2\"/><path d=\"M16 8V3H3v13h5\"/>",
  "edit": "<path d=\"M4 16l12-12 4 4L8 20H4v-4M14 6l4 4\"/>",
  "unknown": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M10 8a2 2 0 1 1 3 2c-1 .5-1 1-1 2m0 4h.01\"/>",
  "settings": "<path d=\"M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.63l-1.92-3.32a.49.49 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.62-.94l-.36-2.54a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.6.22L2.68 8.85a.49.49 0 0 0 .12.63l2.03 1.58a7.3 7.3 0 0 0 0 1.88L2.8 14.52a.49.49 0 0 0-.12.63l1.92 3.32c.12.22.38.31.6.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.04.24.24.42.49.42h3.84c.25 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.48 0 .6-.22l1.92-3.32a.49.49 0 0 0-.12-.63zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z\"/>",
  "help": "<path d=\"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-3h2v-2h-2v2zm1-11a4 4 0 0 0-4 4h2a2 2 0 1 1 4 0c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z\"/>",
  "chevron": "<path d=\"M4 6l4 4 4-4\"/>",
  "add": "<path d=\"M12 5v14M5 12h14\"/>",
  "close": "<path d=\"m6 6 12 12M6 18 18 6\"/>",
  "save": "<path d=\"M5 3h12l4 4v14H3V3h2M7 3v6h10V3M7 21v-8h10v8\"/>",
  "up": "<path d=\"m5 15 7-7 7 7\"/>",
  "left": "<g transform=\"rotate(-90 12 12)\"><path d=\"m5 15 7-7 7 7\"/></g>",
  "right": "<g transform=\"rotate(90 12 12)\"><path d=\"m5 15 7-7 7 7\"/></g>",
  "menu": "<path d=\"M4 6h16M4 12h16M4 18h16\"/>",
  "down": "<path d=\"m5 9 7 7 7-7\"/>",
  "media-alarmFilled": "<path fill-rule=\"evenodd\" d=\"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 3h2v4.4l3 1.8-1 1.7-4-2.4V7ZM3.5 1.8l1.3 1.5-3.4 2.9L.1 4.7l3.4-2.9Zm17 0 3.4 2.9-1.3 1.5-3.4-2.9 1.3-1.5Z\"/>",
  "media-alarm": "<path fill-rule=\"evenodd\" d=\"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-1 1h2v5.4l3 1.8-1 1.7-4-2.4V7ZM3.5 1.8l1.3 1.5-3.4 2.9L.1 4.7l3.4-2.9Zm17 0 3.4 2.9-1.3 1.5-3.4-2.9 1.3-1.5Z\"/>",
  "media-previous": "<path fill-rule=\"evenodd\" d=\"M6 5h2v14H6zM18 5v14l-9-7z\"/>",
  "media-next": "<path fill-rule=\"evenodd\" d=\"M16 5h2v14h-2zM6 5l9 7-9 7z\"/>",
  "media-play": "<path fill-rule=\"evenodd\" d=\"M8 5v14l11-7z\"/>",
  "media-pause": "<path fill-rule=\"evenodd\" d=\"M6 5h4v14H6zM14 5h4v14h-4z\"/>",
  "media-stop": "<path fill-rule=\"evenodd\" d=\"M6 6h12v12H6z\"/>",
  "media-star": "<path fill-rule=\"evenodd\" d=\"m12 2.5 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-1z\"/>",
  "media-radio": "<path fill-rule=\"evenodd\" d=\"M4 7h16v13H4zM6 3l13-2v2L6 5zM6 9v3h12V9zM7 14h5v4H7zM15 14h3v2h-3z\"/>",
  "media-shuffle": "<path fill-rule=\"evenodd\" d=\"m16 3 5 4-5 4V8h-2l-4 5-4 5H3v-2h2l4-5 4-5h3V3ZM3 6h3l3 4-1.3 1.6L5 8H3V6Zm9 7.4 2 2.6h2v-3l5 4-5 4v-3h-3l-2.3-3 1.3-1.6Z\"/>",
  "media-music": "<path fill-rule=\"evenodd\" d=\"M16 3v11.6a4 4 0 1 0 2 3.4V7h4V3h-6ZM8 6H2v2h6V6Zm0 5H2v2h6v-2Zm-2 5H2v2h4v-2Z\"/>"
});
export const ICON_NAMES = Object.freeze(Object.keys(ICON_PATHS));
export function icon(name, {expanded = false} = {}) {
  if (!Object.hasOwn(ICON_PATHS, name)) throw new TypeError(`Unknown icon: ${name}`);
  const filled = name === 'settings' || name === 'help' || name.startsWith('media-');
  const chevron = name === 'chevron';
  return `<svg class="ui-icon${filled ? ' filled' : ''}${chevron ? ' chevron' : ''}${chevron && expanded ? ' expanded' : ''}" data-icon="${name}" viewBox="0 0 ${chevron ? '16 16' : '24 24'}" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
}
