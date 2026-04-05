---
title: Automating Go Project Releases with GitHub Actions
description: Using Make, Shell Scripting, Goreleaser, and GitHub Actions to Automatically Publish Binaries for New Versions
date: 2024-06-15
tags: go, github, deploy, automation
    - post
layout: layouts/post.njk
---

GitHub Actions can be a pain in the ass. However, they  allow you to automate your deployment pipeline relatively quickly (if you're lucky). The idea is simple: you have something like an Ansible playbook with a few steps that run on a virtual machine to test, build and publish your project. You have a library of [actions](https://github.com/marketplace?type=actions) that you can use to speed up setup time. At the end of the day you are trying to run simple Linux commands by using complicated ecosystem of github actions.

Lately, I've been learning Go. Slowly, without rushing. I enjoy this journey. It's something to take a break from the painful code I deal with every day.

This is how I like to set up Go projects:

1. Create a [Makefile](#makefile)
2. Extend the default test runner with watch mode and colorful output: [test-watch.sh](#test-watch.sh)
3. Set up [GitHub Actions](github-actions) and [Goreleaser](goreleaser) to automate publishing releases with compiled binary

## Makefile

I don't remember the origin of this file. I'll provide a link to the GitHub repository or blog if I find it. I was watching Twitch after a few too many shots of vodka when a streamer mentioned it, and I wanted it. It's perfect for me. I've added some of my stuff, changed a few lines, and in general, I like how tidy it is.

```makefile
# Change these variables as necessary.
MAIN_PACKAGE_PATH := .
BINARY_NAME := app-name

# ==================================================================================== #
# HELPERS
# ==================================================================================== #

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

.PHONY: no-dirty
no-dirty:
	git diff --exit-code


# ==================================================================================== #
# QUALITY CONTROL
# ==================================================================================== #

## tidy: format code and tidy modfile
.PHONY: tidy
tidy:
	go fmt ./...
	go mod tidy -v

## audit: run quality control checks
.PHONY: audit
audit:
	go mod verify
	go vet ./...
	go run honnef.co/go/tools/cmd/staticcheck@latest -checks=all,-ST1000,-U1000 ./...
	go run golang.org/x/vuln/cmd/govulncheck@latest ./...
	go test -race -buildvcs -vet=off ./...


# ==================================================================================== #
# DEVELOPMENT
# ==================================================================================== #

## test: run all tests
.PHONY: test
test:
	go test -v -race -buildvcs ./...

## test/watch: run all tests in watch mode
.PHONY: test/watch
test/watch:
	./test-watch.sh

## test/cover: run all tests and display coverage
.PHONY: test/cover
test/cover:
	go test -v -race -buildvcs -coverprofile=/tmp/coverage.out ./...
	go tool cover -html=/tmp/coverage.out

## build: build the application
.PHONY: build
build:
	# Include additional build steps, like TypeScript, SCSS or Tailwind compilation here...
	go build -o=/tmp/bin/${BINARY_NAME} ${MAIN_PACKAGE_PATH}

## run: run the  application
.PHONY: run
run: build
	/tmp/bin/${BINARY_NAME}

## run/watch: run the application with reloading on file changes
.PHONY: run/watch
run/watch:
	go run github.com/cosmtrek/air@v1.43.0 \
		--build.cmd "make build" --build.bin "/tmp/bin/${BINARY_NAME}" --build.delay "100" \
		--build.exclude_dir "" \
		--build.include_ext "go, tpl, tmpl, html, css, scss, js, ts, sql, jpeg, jpg, gif, png, bmp, svg, webp, ico" \
		--misc.clean_on_exit "true"


# ==================================================================================== #
# OPERATIONS
# ==================================================================================== #

## push: push changes to the remote Git repository
.PHONY: push
push: tidy audit no-dirty
	git push

## production/deploy: deploy the application to production
.PHONY: production/deploy
production/deploy: confirm tidy audit no-dirty
	GOOS=linux GOARCH=amd64 go build -ldflags='-s' -o=/tmp/bin/linux_amd64/${BINARY_NAME} ${MAIN_PACKAGE_PATH}
	upx -5 /tmp/bin/linux_amd64/${BINARY_NAME}
	# Include additional deployment steps here...

```


## test-watch.sh

Call me crazy but I do like to have test running all the time on separate screen. Call me crazy but I do like to have them green and red. Golang provide none of this function's. Lucky, for me, it's just a few lines of simple bash.

```bash
#!/usr/bin/env sh

run_test() {
		go test -v -race -buildvcs ./... | \
			sed ''/PASS/s//$(printf "\033[32mPASS\033[0m")/'' | \
			sed ''/FAIL/s//$(printf "\033[31mFAIL\033[0m")/'' | \
			sed ''/RUN/s//$(printf "\033[33mRUN\033[0m")/''
}

echo "[$(date +%Y-%m-%d_%H-%m_%S)]"
echo "========================================"

run_test

echo ''

while true; do
	inotifywait -qq -r -e create,close_write,modify,move,delete ./ &&
		echo "[$(date +%Y-%m-%d_%H-%m_%S)]" &&
		echo "========================================" &&
		run_test

	echo ''
done
```

## GitHub actions

This is one of those tools that you love to use but hate to debug. You are behind an abstraction layer from a simple server, where debugging anything involves a lot of time and waiting for this stupid server to spin and show you more or less useful errors. You better know the real server because often it's like solving a Rubik's cube blindfolded. When it's finally done, it's beautiful. Small gnomes, somewhere in the cloud, spin the wheel without your need to even move a finger.

I've tried a few approaches. I've decided to stick with [Goreleaser](https://goreleaser.com/).

I want a new build and release only when I'm pushing a new tag. I do use tags for versioning. I don't like release branches for simple projects.

In the root directory, I'm creating a directory and YAML file with GitHub Actions.

```bash
mkdir -p .github/workflows
touch .github/workflows/release.yml
```

Content of release.yml is very simple:

```yaml
name: Release Go project

on:
  push:
    tags:
      - "*"

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Go
        uses: actions/setup-go@v4

      # - run: go build -v
      - name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v5
        with:
          # either 'goreleaser' (default) or 'goreleaser-pro'
          distribution: goreleaser
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

As you can see you need to have [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication), what's another good reason to do it this way.

## Goreleaser

Main configuration is separate file that is in root folder, and is independent of github actions. Default's are sensible, I wasn't need to make many changes here. `ldflags` are interesting for apps that want to show it's version to user.

This is more or less my `.goreleaser.yaml` file

```yaml
# This is an example .goreleaser.yml file with some sensible defaults.
# Make sure to check the documentation at https://goreleaser.com
# before:
  # hooks:
    # You may remove this if you don't use go modules.
    # - go mod tidy
    # you may remove this if you don't need go generate
    # - go generate ./...
builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin
    ignore:
      - goos: darwin
        goarch: arm64
      - goos: linux
        goarch: arm64
    # ldflags:
      # - "-X eslint-git-diff/cmd.stringVersion={{.Version}}"

archives:
  - format: tar.gz
    # this name template makes the OS and Arch compatible with the results of uname.
    name_template: >-
      {{ .ProjectName }}_
      {{ .Version }}_
      {{- title .Os }}_
      {{- if eq .Arch "amd64" }}x86_64
      {{- else if eq .Arch "386" }}i386
      {{- else }}{{ .Arch }}{{ end }}
      {{- if .Arm }}v{{ .Arm }}{{ end }}
    # use zip for windows archives
    format_overrides:
    - goos: windows
      format: zip
checksum:
  name_template: 'checksums.txt'
snapshot:
  name_template: "{{ incpatch .Version }}-next"
changelog:
  sort: asc
  filters:
    exclude:
      - '^docs:'
      - '^test:'

# The lines beneath this are called `modelines`. See `:help modeline`
# Feel free to remove those if you don't want/use them.
# yaml-language-server: $schema=https://goreleaser.com/static/schema.json
# vim: set ts=2 sw=2 tw=0 fo=cnqoj
```


