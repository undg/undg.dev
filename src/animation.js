// Animate intersection and onLoad
export function setupFadeInStyles() {
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

export function animateOnScroll() {
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

export function animateHeader() {
	const header = document.querySelector("header > h1")
	if (!header) {
		return
	}

	header.classList.add("fade-in")
	setTimeout(() => {
		header.classList.add("visible")
	}, 300)
}
