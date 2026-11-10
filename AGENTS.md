# Gemeinsamer Home-Assistant-UI-Baukasten

- Referenz: Shutter Manager 1.4.0, siehe docs/PROVENANCE.json.
- Komponenten und Symbole in src/ pflegen. dist/ ausschließlich mit npm run build erzeugen.
- HA-Themes respektieren; kein CDN und keine Netzwerkabhängigkeit zur Laufzeit einführen.
- Gemeinsame Symbole, Schrift und Abstände nicht pro Integration abwandeln.
- Öffentliche API/Designänderungen versionieren und Integrations- sowie Designanleitung aktualisieren.
- Feste, lokale UI-Versionen verwenden; kein automatischer Laufzeitbezug von main/latest.
- Bestehende Integrationen nur im ausdrücklich beauftragten Umfang ändern. docs/ADOPTION.md muss tatsächlich veröffentlichte Übernahmen widerspiegeln.
- Vor Veröffentlichung: npm run build, npm test, npm run check, npm run test:browser. Helles/dunkles Theme sowie Desktop/Handy prüfen.
- UI-Baukasten enthält keine Berechtigungs- oder Automationslogik. Bestehende Fachlogik bei Umstellungen erhalten und gesondert prüfen.
