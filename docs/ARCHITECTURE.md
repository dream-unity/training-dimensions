# Architecture

Training Dimensions is a static React/Vite application deployable through GitHub Pages.

- `src/App.tsx` contains the dimensional curriculum, map state machine, SVG workspace, semantic-edge editor, branch prompts, inspectors, selected-mode scoring and JSON portability.
- `src/dimension-experiences.tsx` defines twelve distinct laboratories, the front-page teaching guide, dimension-specific coaching panels, SVG map scaffolds and prompt-placement geometry.
- `src/dimension-experiences.css` gives every dimension its own visual grammar, canvas field and responsive guide treatment.
- `src/styles.css` provides the inherited responsive laboratory interface.
- Browser `localStorage` provides private, immediate autosave under `dream-unity.training-dimensions.v1`.
- JSON export/import provides user-controlled portability.
- The inherited Theory source modules remain available as the copied baseline, while the production entry point is the dimensional laboratory.
- `scripts/finalize-build.mjs` prepares a clean Pages artifact without carrying old build generations.
