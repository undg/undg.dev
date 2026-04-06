# Agent Notes

## Build Pipeline

- **CSS**: `_11ty/optimize-html.js` reads all `css/*.css`, concatenates, runs per-page PurgeCSS + csso minification, and inlines the result into `<style>` tags in `</head>`. CSS files are never linked; changes must be made under `css/` (skipped for AMP and when `data-style-override` is present).
- **JS**: `src/main.js` is the entry point. Rollup bundles to `js/min.js` (IIFE + terser). Edit files under `src/`, never hand-edit `js/min.js`. Run `npm run js-build` to rebuild.
- **Build command**: `npm run build` runs `js-build` → `eleventy` → `test` in sequence. Tests validate the built `_site/` output.

## Development

- **Watch mode**: `npm run watch` runs eleventy server, JS rebuild watcher, and test watcher concurrently via `concurrently`.
- **CSS hot reload**: `.eleventy.js` has `addWatchTarget("./css/")` so CSS changes trigger rebuilds. `setUseGitIgnore(false)` is required for watch targets to detect changes properly.
- **Cache busting**: The `addHash` filter appends content hashes to asset URLs (e.g., `/js/min.js?hash=abc123`). Hashes are computed from `_site/` file contents.

## Testing

- Tests run against built `_site/` output using JSDOM, not source files.
- `test/test-generic-post.js` expects `_site/posts/ets2-on-two-monitors/index.html` to exist; tests skip if this post is missing from the build.
- Run `npm run test` or `npm run test-watch` for continuous testing during development.

## Code Highlighting

- Markdown code blocks use `@11ty/eleventy-plugin-syntaxhighlight` which outputs PrismJS markup: `pre[class*="language-"]` > `code`.
- UI controls on code blocks should target this selector and use `pre { position: relative; }` for reliable absolute positioning.

## Eleventy Configuration

- Custom plugins live in `_11ty/` (img-dim, optimize-html, apply-csp, etc.)
- Third-party plugin vendored at `third_party/eleventy-plugin-local-images/` (not npm)
- Template engines: Markdown → Liquid, HTML → Nunjucks, Data → Nunjucks
- Output directory: `_site/` (hardcoded in multiple places)
