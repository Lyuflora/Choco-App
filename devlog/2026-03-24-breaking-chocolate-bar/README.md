# Breaking Chocolate Bar Milestone

Date: 2026-03-24

## Summary

This milestone reshapes the Today screen from a standard form-first logger into a ritual-first interaction centered on breaking a chocolate bar before logging.

## Changes

- Replaced the plain segmented quick log header on the Today screen with a hero section and ritual flow.
- Added a new animated `ChocolateBar` component for the first interaction on the Today screen.
- Introduced ritual phases: `idle`, `interacting`, `logging`, and `saved`.
- Added quick-select bite amounts for eating logs: `0.25`, `0.5`, and `1` bar.
- Moved detailed fields behind an explicit `+ Add details` toggle so the first path stays lightweight.
- Added compact stat pills for entries, calories, and spend near the hero interaction.
- Reworked save copy to match the new ritual language, including the saved-state CTA `Break Another Piece`.
- Restyled the Today log history into a dedicated section below the ritual card.
- Restored the missing shared `ChoiceChipGroup` component so the updated Today screen can render on web as well as mobile.

## Files

- `app/(tabs)/today.tsx`
- `src/components/today/ChocolateBar.tsx`
- `src/components/ui/ChoiceChipGroup.tsx`

## Screenshots

- `screenshots/README.md`

Note: verified screenshot regeneration after the web fix was skipped in-session.
