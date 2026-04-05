---
title: Bloated PATH in wsl
description: Bloated $PATH in wsl cousing performance issues.
date: 2021-06-15
tags:
    - post
layout: layouts/post.njk
---

### Issue

If you have a perfomance issues in your terminal under wsl2, quite possibly root of your problem is windows directories in your PATH. It's obvious when using auto-completion. Press `<TAB>` and terminal is freazzing for several seconds.

### Hack Fix

To fix that, remove `/mnt/` from path by adding this line to your `.bashrc` or `.profile` file and then `source` it. It is not the most elegant way, but it is doing its job. Grep it, split it, join it and export it back to PATH.

```bash
export PATH=$(/usr/bin/printenv PATH | /usr/bin/perl -ne 'print join(":", grep { !/\/mnt\/[a-z]/ } split(/:/));'
```

### Confugure wsl.conf

If you like, you can try to configure wsl. There is option for that, but I had have no luck with that approach. You can read more about how to [configure WSL](https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/)

/etc/wsl.conf

```ini
[interop]
appendWindowsPath = false
```
