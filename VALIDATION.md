# HA UI Kit 1.5.0 verification

Verified on 2026-11-14. Candidate 43f86e3f3e76215ea6c62f3905987ff1195afee7 passed the complete workflow: https://github.com/v9h45n47mh-lab/ha-ui-kit/actions/runs/43603168539. Publication repeats validation for the exact release commit.

Build, consistency/vendoring checks, all 24 unit tests and all six browser suites passed. New tests cover canonical skip-once/reschedule SVGs, optional compact text/icon buttons, unchanged default geometry, escaped labels, disabled controls and accessible icon buttons. At 320/390/1100 px in light/dark themes, Skip is at least 12 px narrower than the former full-label button, while both controls retain at least 40 px touch height. Compact icons are 16 px; native keyboard Enter/Space activates the expected action. Screenshots and measurements are attached to the workflow.

The compact controls were visually inspected at 320 px in dark and 1100 px in light. Existing component, program-row, account-tile, gallery and music-player browser suites also passed, including the pinned original Shutter reference. Default fonts, colors, spacing and controls are unchanged. The kit contains presentation only; applications own all scheduling, date, persistence and permission validation.
