# Tinder Swipe Parody Design

## Goal
Build a Tinder-style parody page that uses only Jaskaran's profile photos and guarantees a match regardless of swipe direction.

## Scope
- New standalone page at `tinder-parody.html`.
- Mobile-first swipe experience with drag and button controls.
- Five photos in deck, no backend.
- Audio effects and ambient loop behind explicit user opt-in.
- Final reveal panel with exact copy: `will you be valentine?`
- Giant `YES` button triggers confetti and deck reset loop.

## Message Rules
- Left swipe on any card: `you are kutie`
- Right swipe progression:
  1. `you are lucky`
  2. `you are the chosen one`
  3. `You got a punjabi.`
  4. `fate has decided`
- After five total swipes, show final panel.

## Assets
- Photos:
  - `assets/photos/me-1.jpg`
  - `assets/photos/me-2.jpg`
  - `assets/photos/me-3.jpg`
  - `assets/photos/me-4.jpg`
  - `assets/photos/me-5.jpg`
- Audio:
  - `assets/audio/ambient.mp3`
  - `assets/audio/swipe-left.mp3`
  - `assets/audio/swipe-right.mp3`
  - `assets/audio/match.mp3`

## Interaction Model
- Pointer drag on top card determines swipe direction by distance/velocity thresholds.
- `X` button maps to left swipe; `HEART` button maps to right swipe.
- Missing media should fail gracefully:
  - missing image -> card still renders with fallback treatment
  - blocked audio -> experience remains fully usable

## Non-Goals
- No persistent storage
- No analytics
- No changes to Cursed Archive flow
