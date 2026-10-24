## Problem and resulting behavior

Explain the concrete trigger, what happened before, and what happens now.

## Verification

List the commands or manual steps actually run, browser/viewports if relevant, and pass/fail results. Do not check off tests that were not run.

Suggested project checks: For the static studio, verify camera permission denial, capture, retake, JPG export and GIF export using a test camera or synthetic frames. For the separate React app run `npm run build`; `npm run lint` reports its existing lint state. Run `python3 scripts/source-preflight.py` for inline-script syntax checks once available.

Relevant user journey: Select a layout, allow camera access, capture a complete strip, retake a shot, add a caption/sticker, and export. Test permission denial and verify tracks stop after leaving capture. Test Share only on a browser that supports it.

## Risks and recovery

Describe persisted-data effects, provider/API changes, and rollback steps if applicable.

## Privacy

Use synthetic frames or consented test images. Never attach private portraits or automatic webcam recordings. Local processing and user-directed sharing are different privacy boundaries.
