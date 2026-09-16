# Phase 4 watch asset standard

Phase 4 converts the configurator from a full-watch placeholder into independent watch-part layers.

## Production canvas

Every production visual layer uses the same transparent canvas:

- 1200 × 1600 px
- transparent WebP
- same camera angle
- same watch center
- same lug/crown positions
- same lighting direction
- no per-SKU CSS positioning

Recommended production structure:

```text
public/assets/parts/
  cases/
    classic-39.webp
  dials/
    midnight-blue.webp
    obsidian-black.webp
    silver-grain.webp
  hands/
    dauphine.webp
  straps/
    steel-back.webp
    steel-front.webp
  casebacks/
    exhibition.webp
  common/
    crystal-highlight.webp
```

## Current 9015 golden sample

The first Phase 4 sample is:

- Miyota 9015
- Classic 39
- Midnight Blue / Obsidian Black / Silver Grain
- Dauphine hands
- Steel Bracelet
- Exhibition back

Until standalone transparent WebP files are supplied, the sample uses `SourceDerivedLayer.vue` to split the existing high-quality watch render into independent source-derived layers. This is intentionally transitional: it lets the layer engine, transitions, compatibility and selection behavior be verified without lowering the current visual quality.

A production WebP can replace any source-derived layer simply by setting `previewLayer`, `backLayer`, or `frontLayer` in `watchParts.js`. No `WatchPreview` positioning change should be required.

## Asset validation

```bash
npm run validate:assets
```

This accepts the Phase 4 source-derived prototype and validates any configured standalone asset paths.

Before production asset sign-off run:

```bash
npm run validate:assets:strict
```

Strict mode rejects source-derived prototype layers and requires the golden sample to be replaced with standalone production WebP files.

## Layer order

```text
strap-back
case
dial
hands
crystal
strap-front
```

The full-watch placeholder remains available only as a fallback. It disappears automatically when all required composite layers are loaded.
