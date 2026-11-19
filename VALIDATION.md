# Prüfung 1.12.0

Stand: 19.11.2026. Aufklappbare Stundenwerte geprüft mit lokalem Build, Prüfsummen und 44 erfolgreichen Unit-Tests.

- Alle neun Browser-Suiten bestanden, einschließlich vorhandener Komponenten und Shutter-Referenz.
- Wetterzeiträume mit eigenständigen Stundenwerten per Maus, Enter/Leertaste und echtem Touch geöffnet und geschlossen. Farben, kompakte Darstellung, fehlender horizontaler Überlauf und deckungsgleiche Windspalten bei 1100/768/390/320 px hell/dunkel geprüft; Ansichten gesichtet.
- Weather Analysis: 88 Backendprüfungen, tatsächliche stündliche Sensorintegrale und Vorhersagedaten, Messlücken, Teilstunden, Niederschlagssummen, stabile Falt-IDs sowie Zeitumstellung mit 23/25 Stunden geprüft.
- Wetterkarte einschließlich gemerkter Stundenbereiche bei Reiterwechsel und Aktualisierung geprüft; 41 Bildschirmaufnahmen bei 1100/390/320 px hell/dunkel ohne JavaScriptfehler.
- Erfolgreicher UI-Kit-CI-Lauf: https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/44516826881
- Erfolgreicher Weather-Analysis-CI-Lauf: https://github.com/v9h45n47mh-lab/weather-analysis/actions/runs/44517051732

Der Main-Release prüft Build, Unit-Tests und Browser erneut vor dem Erstellen des Releases.
