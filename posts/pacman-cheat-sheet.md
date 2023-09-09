---
title: Pacman cheat sheet
description: Usefull flags to navigate arch repository
date: 2023-09-09
tags: linux, pacman, repo
    - post
layout: layouts/post.njk
---


Update system
: `pacman -Suy`

Sync remote
:   `pacman -Sy`

Install package
:   `pacman -S [pkg name]`

Uninstall package
:   `pacman -R [pkg name]`

Uninstall package with its unneeded dependencies
:   `pacman -Rus [pkg name]`

Search for package in remote by name
:   `pacman -Ss [pkg name]`

Search for package name in remote that contains file
:   `pacman -Fy`

Search for package name in system that contains file
:   `pacman -Qo`

List of installed packages, that are part of official repository. Exclude dependencies.
:   `pacman -Qne | awk '{print $1}'`

List of installed packages, not found in official repository.
Most likely from AUR, however sometimes they are packages that are no longer maintained.
:   `pacman -Qm`
