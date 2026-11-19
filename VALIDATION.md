# Prüfung 1.11.0

Stand: 19.11.2026. Vertikale Wetterliste geprüft mit lokalem Build, Prüfsummen und 43 erfolgreichen Unit-Tests.

- Alle neun Browser-Suiten bestanden, einschließlich unveränderter Shutter-Referenz und bestehender horizontaler Wetterdarstellung.
- Wetterzeilen bei 1100/768/390/320 px hell/dunkel geprüft. Zusätzliche 300-px-Karte auf großem Desktop, natürliche Reihenfolge, fehlender horizontaler Überlauf und vertikales Touch-Scrollen geprüft; Ansichten gesichtet.
- Weather Analysis: Startreiter Wetter, aktuelle Werte genau einmal innerhalb von Ist, Einklappen unabhängig von der Vorhersage sowie Zustandserhalt beim Aktualisieren und Reiterwechsel geprüft. 35 Bildschirmaufnahmen bei 1100/390/320 px hell/dunkel ohne JavaScriptfehler.
- Erfolgreicher UI-Kit-CI-Lauf: https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/44509832146
- Erfolgreicher Weather-Analysis-CI-Lauf: https://github.com/v9h45n47mh-lab/weather-analysis/actions/runs/44509973933

Der Main-Release prüft Build, Unit-Tests und Browser erneut vor dem Erstellen des Releases.
