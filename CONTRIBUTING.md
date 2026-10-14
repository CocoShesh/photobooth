# Contributing to photobooth

## Start with the correct application

The live static studio is `studio/index.html`. Run `python3 -m http.server 8080 --directory studio` from the repository root and open http://localhost:8080. No build is needed for this version. The separate original React application uses `npm ci` and `npm run dev`; do not confuse the two entry points.

## Keep changes reviewable

Describe the observed problem and the behavior after your change. Keep one concern per pull request; avoid unrelated dependency updates and formatting churn. Read existing repository instructions before changing source.

## Verification

For the static studio, verify camera permission denial, capture, retake, JPG export and GIF export using a test camera or synthetic frames. For the separate React app run `npm run build`; `npm run lint` reports its existing lint state. Run `python3 scripts/source-preflight.py` for inline-script syntax checks once available.

For browser changes, check 390 × 844, 768 × 1024 and 1440 × 900 viewports. Look for horizontal overflow, clipped controls, readable text and keyboard focus. Record the actual browser and dimensions; a screenshot alone does not prove the whole journey.

Useful end-to-end check: Select a layout, allow camera access, capture a complete strip, retake a shot, add a caption/sticker, and export. Test permission denial and verify tracks stop after leaving capture. Test Share only on a browser that supports it.

## Handle sensitive data

Use synthetic frames or consented test images. Never attach private portraits or automatic webcam recordings. Local processing and user-directed sharing are different privacy boundaries.

## Before opening a pull request

- Explain what changed and why.
- List commands actually run and their results; state skipped checks explicitly.
- Include reproducible steps for bug fixes and relevant screenshots for UI changes.
- Describe migration or rollback needs when changing persisted data.
