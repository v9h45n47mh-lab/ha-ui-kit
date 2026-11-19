# Prüfung 1.10.0

Stand: 19.11.2026. Wetterbausteine geprüft mit lokalem Build, Prüfsummen und 42 erfolgreichen Unit-Tests.

- Alle neun Browser-Suiten bestanden, einschließlich unveränderter Shutter-Referenz, Energieansichten und neuer Wetterdarstellung.
- Neue Wetterbausteine bei 1100/768/390/320 px in hellen und dunklen Themes geprüft; Maus/Scrollen, Tastatur, echter Touch-Swipe, Quellenfarben, Symbolzuordnung und Seitenbreite geprüft.
- Ansichten von Weather Analysis zusätzlich bei 1100/390/320 px hell/dunkel visuell geprüft, 35 Bildschirmaufnahmen ohne JavaScriptfehler.
- Erfolgreicher UI-Kit-CI-Lauf: https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/44506465739
- Erfolgreicher Weather-Analysis-CI-Lauf: https://github.com/v9h45n47mh-lab/weather-analysis/actions/runs/44506520490

Der Main-Release prüft Build, Unit-Tests und Browser erneut vor dem Erstellen des Releases.
