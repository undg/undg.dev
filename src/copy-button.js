// Copy button for code blocks
// related files
// ../css/copy-button.css

const COPY_ICON_SVG = `
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
	<path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"/>
</svg>
`

/**
 * Setup copy buttons for all Prism-highlighted code blocks.
 */
export function setupCopyButtons() {
	const blocks = document.querySelectorAll("pre[class*='language-']")

	blocks.forEach((pre) => {
		// Ensure positioning context for absolute button.
		pre.classList.add("has-copy-button")

		if (pre.querySelector(":scope > .copy-button")) {
			return
		}

		const button = document.createElement("button")
		button.type = "button"
		button.className = "copy-button"
		button.setAttribute("aria-label", "Copy code")
		button.setAttribute("title", "Copy")
		button.innerHTML = COPY_ICON_SVG

		button.addEventListener("click", async () => {
			const code = pre.querySelector("code")
			const text = code ? code.textContent : pre.textContent

			try {
				await navigator.clipboard.writeText(text)
				button.classList.add("copied")
				button.setAttribute("title", "Copied")

				setTimeout(() => {
					button.classList.remove("copied")
					button.setAttribute("title", "Copy")
				}, 1200)
			} catch (err) {
				console.error("Failed to copy:", err)
				button.classList.add("failed")
				button.setAttribute("title", "Failed")
				setTimeout(() => {
					button.classList.remove("failed")
					button.setAttribute("title", "Copy")
				}, 1200)
			}
		})

		pre.appendChild(button)
	})
}
