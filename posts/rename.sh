#!/bin/sh

for file in *.md; do
	date=$(rg date: "$file" | cut -f 2 -d ' ')
	mv "$file" "$date-$file"
done
