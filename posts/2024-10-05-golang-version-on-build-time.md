---
title: Adding Version Info to Your Go App at Build Time
description: Learn how to automatically embed your app's version from Git tags into your Go binary during build.
date: 2024-10-05
tags:
    - post
    - golang
layout: layouts/post.njk
---

## Intro

Want app to show its version? Here's how.

Git tags are like labels for code versions. ldflags are special instructions for Go builder.

I like git tags as a single source of version the app. Based on them I run builds and releases. To add same version to Go app in automated way we can use `ldflags`.

## Add one variable on build time

1. Create file `main.go` with content

```go main.go
package main
import "fmt"

var version = "dev"

func main() {
    fmt.Println("Version:\t", version)
}
```

2. To your build script add `-ldflags` where `main.version` is package and var from code above.

```bash
go build -ldflags "-X main.version=$(git describe --abbrev=0 --tags)"
```

## Add multiple variables on build time

Adding multiple variables on build time is as simple as follow.

1. Edit `main.go` and add `buildTime` variable

```go main.go
package main
import "fmt"

var (
    version = "dev"
    buildTime = "devTime"
)

func main() {
    fmt.Println("Version:\t", version)
    fmt.Println("Build time:\t", buildTime)
}
```

2. Edit `-ldfalgs` by adding another `-X` block

```bash
go build -ldflags "-X main.version=$(git describe --abbrev=0 --tags) -X main.buildTime=$(date)"
```

## Encapsulate variables in different package than main

If you want to import those variables to different package than `main` it's good practice to encapsulate it in different package.
Let's keep them in package `build` in separate directory.

Create directory `build` and file `build/build.go`

```bash
mkdir build
touch build/build.go
vim build/build.go
```

```go build.go
package build

var (
	// These variables are replaced by ldflags at build time
	GitVersion = "v0.0.0-main"
	GitCommit  = ""
	BuildTime  = "1970-01-01T00:00:00Z" // build date in ISO8601 format
)
```

And we can print in in `main.go` as an example

```go main.go
package main

import (
	"fmt"

	"github.com/me/my-app/build"
)

func main() {
	fmt.Println("GitCommit:\t", build.GitCommit)
}
```

This time you need to know your module name. It's in first line of `go.mod` file

```bash
$> head -1 go.mod
module github.com/me/my-app
```

Finally we can compose command where `github.com/me/my-app` is our main module, `github.com/me/my-app/build` is full path to `build` package and `GitCommit` is variable dynamically linked on build time
```bash
go build -ldflags="-X 'github.com/me/my-app/build.GitCommit=$(shell git rev-parse --short=7 HEAD)'" -o=/tmp/bin/my-app .
```


## Conclusion

Adding version to your app is useful for 'About' page, startup info or --version command line flag. It's like putting a sticker on a product after it's made. This info is essential for debugging app that is already on production. Now users always know which version they're using!
