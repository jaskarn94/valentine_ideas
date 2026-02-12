# Cursed Archive Design

## Goal
Build a multi-page Valentine experience that starts as fake horror and resolves into a romantic reveal.

## Experience Flow
1. `index.html`: Mirror gate and warning.
2. `intake.html`: Archive intake rules and case framing.
3. `witness-01.html`: First eerie log with semi-personal clue.
4. `witness-02.html`: Escalated corruption and second clue.
5. `final-warning.html`: Countdown and decryption loader.
6. `reveal.html`: Warm reveal and proposal line.

## Core Reveal Requirements
- Final question appears exactly as: `will you be my valentine?`
- “Yes” opens a personalized note with:
  - Name: `Jaskaran`
  - Date: `February 14, 2026`

## Implementation Notes
- Static site, no framework.
- Shared styling in `assets/styles.css` and behavior in `assets/script.js`.
- Horror palette and glitch typography across first five pages.
- Warm palette on reveal page for emotional contrast.
- Responsive layout with single-column fallbacks for mobile.
