# HotB Rebuild

This is a separate rebuild of the KC Rebels HotB hitting app, created from the screenshots and behavior descriptions supplied in the conversation.

## What is implemented

- Home screen
- New Game / matchup / batting order
- Roster editor with R/L batting side
- Live pitch charting
- Pitch type, pitch zone, plan, outs, runners
- B / F / K / looking-K / HBP / HIT / H4O
- HIT and H4O detail screens with fielder selection
- At-bat history
- FPS (first-pitch strike percentage)
- Simple adaptive Ai suggestions from stored pitch history
- Current/saved reports
- Spray chart and zone chart
- AVG / OBP / SLG / OPS
- Count performance buckets
- Player / Team Eval
- HotB+, Runs Produced, Execution
- Evaluation grading thresholds after 25 PA
- Athletic measurement recording with stopwatch/manual entry
- Local persistence using browser localStorage
- CSV export

## Important verification note

The original source code was not recoverable. Most baseball/softball statistics are reconstructed using standard formulas and the explicit rules visible in the screenshots. **Runs Produced is currently a provisional weighted formula** because the exact original formula cannot be recovered from the published app link alone.

The rebuild is intentionally a separate project so the existing live app can remain untouched while the two versions are compared.

## Running locally

Open `index.html` in a modern browser. For iPhone testing, host the folder on any static web server (HTTPS recommended).

## Backup

Keep this entire folder or the included ZIP file. It contains the editable source.
