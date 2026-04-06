# Fix BrowserSync Hot Reloading

## Problem
BrowserSync is not triggering page reloads when files change. User has to manually refresh to see changes.

## Root Causes
1. **404 middleware interference** - `addMiddleware("*", ...)` catches all requests, breaking BrowserSync's reload
2. **Missing `files` configuration** - BrowserSync doesn't know what files to watch
3. **Missing `watch` settings** - No explicit watch configuration for the build output
4. **Cascading build issues** - Race conditions between Rollup and Eleventy

## Solution
Configure BrowserSync properly with explicit file watching and fix the 404 middleware to not interfere with normal operation.

---

## Tasks

- [ ] **Remove or fix the 404 middleware** - Change from catch-all `*` to only handle actual 404s
- [ ] **Add BrowserSync `files` configuration** - Watch `_site/**/*` for changes
- [ ] **Add `watchOptions` with debounce** - Prevent multiple rapid reloads
- [ ] **Test hot reloading** - Verify changes trigger automatic browser refresh

---

## Implementation Details

### Fix 1: Update BrowserSync Config (.eleventy.js)

Replace the current setBrowserSyncConfig with:
```javascript
eleventyConfig.setBrowserSyncConfig({
    notify: true,
    ui: false,
    ghostMode: false,
    files: ["_site/**/*"],  // Watch the built files
    watchOptions: {
        ignoreInitial: true,
        ignored: ["_site/**/*.map"],  // Ignore source maps
    },
    callbacks: {
        ready: function (err, bs) {
            // Only add 404 middleware for actual 404s, not all requests
            bs.addMiddleware("*", (req, res, next) => {
                // Check if file exists first
                const fs = require("fs")
                const path = require("path")
                const filePath = path.join("_site", req.url === "/" ? "/index.html" : req.url)
                
                if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                    // Only serve 404 if file doesn't exist
                    const content_404 = fs.readFileSync("_site/404.html")
                    res.writeHead(404, { "Content-Type": "text/html" })
                    res.write(content_404)
                    res.end()
                } else {
                    next()  // Let BrowserSync handle existing files
                }
            })
        },
    },
})
```

### Alternative Fix (simpler): Remove 404 middleware entirely
If you don't need custom 404 handling during dev, just remove the middleware:
```javascript
eleventyConfig.setBrowserSyncConfig({
    notify: true,
    ui: false,
    ghostMode: false,
    files: ["_site/**/*"],
})
```

---

## Verification Steps
1. Run `npm run watch`
2. Open browser to `http://localhost:8080`
3. Edit any file (CSS, JS, or markdown)
4. Verify browser reloads automatically
5. Check that changes appear without manual refresh
