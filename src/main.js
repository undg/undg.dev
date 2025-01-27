/**
 * Copyright (c) 2020 Google Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const exposed = {}
if (location.search) {
    var a = document.createElement("a")
    a.href = location.href
    a.search = ""
    history.replaceState(null, null, a.href)
}

function tweet_(url) {
    open(
        "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url),
        "_blank"
    )
}
function tweet(anchor) {
    tweet_(anchor.getAttribute("href"))
}
expose("tweet", tweet)

function share(anchor) {
    var url = anchor.getAttribute("href")
    event.preventDefault()
    if (navigator.share) {
        navigator.share({
            url: url,
        })
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
        message("Article URL copied to clipboard.")
    } else {
        tweet_(url)
    }
}
expose("share", share)

function message(msg) {
    var dialog = document.getElementById("message")
    dialog.textContent = msg
    dialog.setAttribute("open", "")
    setTimeout(function () {
        dialog.removeAttribute("open")
    }, 3000)
}

function prefetch(e) {
    if (e.target.tagName != "A") {
        return
    }
    if (e.target.origin != location.origin) {
        return
    }
    /**
     * Return the given url with no fragment
     * @param {string} url potentially containing a fragment
     * @return {string} url without fragment
     */
    const removeUrlFragment = (url) => url.split("#")[0]
    if (
        removeUrlFragment(window.location.href) ===
        removeUrlFragment(e.target.href)
    ) {
        return
    }
    var l = document.createElement("link")
    l.rel = "prefetch"
    l.href = e.target.href
    document.head.appendChild(l)
}
document.documentElement.addEventListener("mouseover", prefetch, {
    capture: true,
    passive: true,
})
document.documentElement.addEventListener("touchstart", prefetch, {
    capture: true,
    passive: true,
})

const GA_ID = document.documentElement.getAttribute("ga-id")
window.ga =
    window.ga ||
    function () {
        if (!GA_ID) {
            return
        }
        ;(ga.q = ga.q || []).push(arguments)
    }
ga.l = +new Date()
ga("create", GA_ID, "auto")
ga("set", "transport", "beacon")
var timeout = setTimeout(
    (onload = function () {
        clearTimeout(timeout)
        ga("send", "pageview")
    }),
    1000
)

var ref = +new Date()
function ping(event) {
    var now = +new Date()
    if (now - ref < 1000) {
        return
    }
    ga("send", {
        hitType: "event",
        eventCategory: "page",
        eventAction: event.type,
        eventLabel: Math.round((now - ref) / 1000),
    })
    ref = now
}
addEventListener("pagehide", ping)
addEventListener("visibilitychange", ping)

/**
 * Injects a script into document.head
 * @param {string} src path of script to be injected in <head>
 * @return {Promise} Promise object that resolves on script load event
 */
const dynamicScriptInject = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = src
        script.type = "text/javascript"
        document.head.appendChild(script)
        script.addEventListener("load", () => {
            resolve(script)
        })
    })
}

// Script web-vitals.js will be injected dynamically if user opts-in to sending CWV data.
const sendWebVitals = document.currentScript.getAttribute("data-cwv-src")

if (/web-vitals.js/.test(sendWebVitals)) {
    dynamicScriptInject(`${window.location.origin}/js/web-vitals.js`)
        .then(() => {
            webVitals.getCLS(sendToGoogleAnalytics)
            webVitals.getFID(sendToGoogleAnalytics)
            webVitals.getLCP(sendToGoogleAnalytics)
        })
        .catch((error) => {
            console.error(error)
        })
}

addEventListener(
    "click",
    function (e) {
        var button = e.target.closest("button")
        if (!button) {
            return
        }
        ga("send", {
            hitType: "event",
            eventCategory: "button",
            eventAction:
                button.getAttribute("aria-label") || button.textContent,
        })
    },
    true
)
var selectionTimeout
addEventListener(
    "selectionchange",
    function () {
        clearTimeout(selectionTimeout)
        var text = String(document.getSelection()).trim()
        if (text.split(/[\s\n\r]+/).length < 3) {
            return
        }
        selectionTimeout = setTimeout(function () {
            ga("send", {
                hitType: "event",
                eventCategory: "selection",
                eventAction: text,
            })
        }, 2000)
    },
    true
)

if (window.ResizeObserver && document.querySelector("header nav #nav")) {
    var progress = document.getElementById("reading-progress")

    var timeOfLastScroll = 0
    var requestedAniFrame = false
    function scroll() {
        if (!requestedAniFrame) {
            requestAnimationFrame(updateProgress)
            requestedAniFrame = true
        }
        timeOfLastScroll = Date.now()
    }
    addEventListener("scroll", scroll)

    var winHeight = 1000
    var bottom = 10000
    function updateProgress() {
        requestedAniFrame = false
        var percent = Math.min(
            (document.scrollingElement.scrollTop / (bottom - winHeight)) * 100,
            100
        )

        progress.style.transform = `translate(-${100 - percent}vw, 0)`
        if (Date.now() - timeOfLastScroll < 3000) {
            requestAnimationFrame(updateProgress)
            requestedAniFrame = true
        }
    }

    new ResizeObserver(() => {
        bottom =
            document.scrollingElement.scrollTop +
            document.querySelector("#comments,footer").getBoundingClientRect()
                .top
        winHeight = window.innerHeight
        scroll()
    }).observe(document.body)
}

function expose(name, fn) {
    exposed[name] = fn
}

addEventListener("click", (e) => {
    const handler = e.target.closest("[on-click]")
    if (!handler) {
        return
    }
    e.preventDefault()
    const name = handler.getAttribute("on-click")
    const fn = exposed[name]
    if (!fn) {
        throw new Error("Unknown handler" + name)
    }
    fn(handler)
})

// There is a race condition here if an image loads faster than this JS file. But
// - that is unlikely
// - it only means potentially more costly layouts for that image.
// - And so it isn't worth the querySelectorAll it would cost to synchronously check
//   load state.
document.body.addEventListener(
    "load",
    (e) => {
        if (e.target.tagName != "IMG") {
            return
        }
        // Ensure the browser doesn't try to draw the placeholder when the real image is present.
        e.target.style.backgroundImage = "none"
    },
    /* capture */ "true"
)

// Animate intersection and onLoad
function setupFadeInStyles() {
    const style = document.createElement("style")
    style.textContent = `
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
    `
    document.head.appendChild(style)
}

function animateOnScroll() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible")
                } else {
                    entry.target.classList.remove("visible")
                }
            })
        },
        {
            threshold: 0.1, // Trigger when at least 10% of the element is visible
        }
    )
    document.querySelectorAll("article > *").forEach((el) => {
        el.classList.add("fade-in")
        observer.observe(el)
    })
}

function animateHeader() {
    const header = document.querySelector("header > h1")
    if(!header) {
        return
    }

    header.classList.add("fade-in")
    setTimeout(() => {
        header.classList.add("visible")
    }, 300)
}

window.addEventListener("load", function () {
    setupFadeInStyles()
    animateOnScroll()
    animateHeader()
})

/**
 * Table Sorting System
 *
 * Adds interactive sorting to all tables within article elements.
 * Click column headers to sort - supports both numeric and text data.
 * Maintains original table order and allows toggling between:
 * - Numeric columns: none -> descending -> ascending -> none
 * - Text columns: none -> descending -> ascending -> none
 *
 * Sort direction indicated by icons:
 * ☰ - default/unsorted
 * ⬆ - ascending order
 * ⬇ - descending order
 *
 * @requires DOM with <article><table> elements
 */
function sortTable() {
    const tables = document.querySelectorAll("article table")

    const ctaIcon = "☰"
    const upIcon = "⬆"
    const downIcon = "⬇"

    tables.forEach((table) => {
        const headers = table.querySelectorAll("th")
        const tbody = table.querySelector("tbody")
        const originalRows = Array.from(table.querySelectorAll("tbody tr"))

        table.setAttribute("data-sort", "none")

        headers.forEach((header, colIndex) => {
            const arrow = document.createElement("span")

            arrow.setAttribute("id", "span-arrow")
            header.append(arrow)
            header.style.position = "relative"

            arrow.style.position = "absolute"
            arrow.style.top = "0.75em"
            arrow.style.right = "0.25em"
            arrow.innerText = ctaIcon

            header.addEventListener("click", () => {
                let sortBy = sortedBy(table)
                let rows = Array.from(table.querySelectorAll("tbody tr"))

                const isNumber = Number.isFinite(
                    +rows[0].cells[colIndex].textContent
                )

                if (isNumber) {
                    if (arrow.innerText === ctaIcon) {
                        table.setAttribute("data-sort", "num-desc")
                    } else if (sortBy === "none") {
                        table.setAttribute("data-sort", "num-desc")
                    } else if (sortBy === "num-desc") {
                        table.setAttribute("data-sort", "num-asc")
                    } else if (sortBy === "num-asc") {
                        table.setAttribute("data-sort", "none")
                    }
                } else {
                    if (arrow.innerText === ctaIcon) {
                        table.setAttribute("data-sort", "abc-desc")
                    } else if (sortBy === "none") {
                        table.setAttribute("data-sort", "abc-desc")
                    } else if (sortBy === "abc-desc") {
                        table.setAttribute("data-sort", "abc-asc")
                    } else if (sortBy === "abc-asc") {
                        table.setAttribute("data-sort", "abc-none")
                    }
                }

                sortBy = sortedBy(table)

                headers.forEach((header) => {
                    const allArrows = header.querySelector("#span-arrow")
                    allArrows.innerText = ctaIcon
                })

                if (sortBy === "num-desc") arrow.innerText = downIcon
                if (sortBy === "abc-desc") arrow.innerText = downIcon

                if (sortBy === "num-asc") arrow.innerText = upIcon
                if (sortBy === "abc-asc") arrow.innerText = upIcon

                if (sortBy === "none") arrow.innerText = ctaIcon

                if (sortBy === "num-desc") {
                    sortRowsDesc(rows, colIndex)
                } else if (sortBy === "num-asc") {
                    sortRowsAsc(rows, colIndex)
                } else if (sortBy === "abc-desc") {
                    sortRowsAbcDec(rows, colIndex)
                } else if (sortBy === "abc-asc") {
                    sortRowsAbcAsc(rows, colIndex)
                } else {
                    rows = originalRows
                }

                rows.forEach((row) => tbody.appendChild(row))
            })
        })
    })
}

function sortedBy(table) {
    const s = table.getAttribute("data-sort")
    return s
}

function sortRowsDesc(rows, colIndex) {
    return rows.sort((a, b) => {
        const aVal = +a.cells[colIndex].textContent
        const bVal = +b.cells[colIndex].textContent
        return aVal - bVal
    })
}

function sortRowsAsc(rows, colIndex) {
    return rows.sort((a, b) => {
        const aVal = +a.cells[colIndex].textContent
        const bVal = +b.cells[colIndex].textContent
        return bVal - aVal
    })
}

function sortRowsAbcDec(rows, colIndex) {
    return rows.sort((a, b) => {
        const aVal = a.cells[colIndex].textContent
        const bVal = b.cells[colIndex].textContent
        return aVal.localeCompare(bVal)
    })
}

function sortRowsAbcAsc(rows, colIndex) {
    return rows.sort((a, b) => {
        const aVal = a.cells[colIndex].textContent
        const bVal = b.cells[colIndex].textContent
        return bVal.localeCompare(aVal)
    })
}

sortTable()

function lightboxInAboutPage() {
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.project-card img').forEach(img => {
            console.log(img)
            img.addEventListener('click', () => {
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';

                const bigImg = img.cloneNode();
                lightbox.appendChild(bigImg);

                lightbox.addEventListener('click', () => lightbox.remove());
                document.body.appendChild(lightbox);

                setTimeout(() => lightbox.style.display = 'flex', 0);
            });
        });
    });
}
lightboxInAboutPage()
