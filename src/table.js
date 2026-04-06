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
export function sortTable() {
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
