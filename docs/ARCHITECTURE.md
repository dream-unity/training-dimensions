# Architecture

Training Dimensions is a static React/Vite application deployable through GitHub Pages.

- `src/App.tsx` contains the dimensional curriculum, map state machine, SVG workspace, semantic-edge editor, branch prompts, inspectors, progress gates and JSON portability.
- `src/styles.css` provides the responsive laboratory interface.
- Browser `localStorage` provides private, immediate autosave under `dream-unity.training-dimensions.v1`.
- JSON export/import provides user-controlled portability.
- The inherited Theory source modules remain available as the copied baseline, while the production entry point is the dimensional laboratory.
- `scripts/finalize-build.mjs` prepares a clean Pages artifact without carrying old build generations.
