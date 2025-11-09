# Contributing

Thanks for helping improve MomentPicker!

## Development
1. Fork and clone this repo.
2. `npm i`
3. Make changes in `src/momentpicker.js`.
4. `npm run build` to produce `dist/momentpicker.min.js`.
5. Open files in `examples/` to test locally.

## Coding notes
- Keep the picker single-file and browser-first.
- No external runtime deps beyond Moment (optional, auto-loaded).
- Avoid breaking the public API without a major version bump.

## Commit style
- Use clear, conventional messages (e.g., `fix:`, `feat:`, `docs:`).
- Link an issue when applicable.

## Pull requests
- Add a brief description and screenshots/gifs where UI changes occur.
- Update README if behavior or options change.
