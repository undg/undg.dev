export function lightboxInAboutPage() {
	document.addEventListener("DOMContentLoaded", () => {
		document.querySelectorAll(".project-card img").forEach((img) => {
			console.log(img)
			img.addEventListener("click", () => {
				const lightbox = document.createElement("div")
				lightbox.className = "lightbox"

				const bigImg = img.cloneNode()
				lightbox.appendChild(bigImg)

				lightbox.addEventListener("click", () => lightbox.remove())
				document.body.appendChild(lightbox)

				setTimeout(() => (lightbox.style.display = "flex"), 0)
			})
		})
	})
}
