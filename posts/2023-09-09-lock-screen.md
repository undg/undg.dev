---
title: Lock screen from scratch
description: Simple lock screen thats independend of your login manager
date: 2023-09-09
tags: linux, bluetooth, keyboard
    - post
layout: layouts/post.njk
---

#### Install dependencies:

```ini
i3lock
imagemagick # convert
scrot
dunst
libnotify # probably already installed with dunst, brave, nemo...
```

`sudo pacman -S i3lock imagemagick scrot dunst`


#### Save script in PATH

Pick filename `lockscreen`

```bash
#!/bin/sh

rm -f /tmp/locked.png
rm -f /tmp/base.png

# If `imagemagick` is installed
[ -f /usr/bin/convert ] &&
scrot -m -z /tmp/base.png &&
pgrep -x dunst && notify-send "Locking computer..." &&
convert /tmp/base.png -blur 0x8 /tmp/locked.png

i3lock -e -f -c 000000 -i /tmp/locked.png
```


Make it executable: `chmod +x lockscreen`
