---
title: Euro Track Simulator 2 on two monitors
description: Force game to occupy 2 screens.
date: 2022-12-29
tags: game, linux, steam
    - post
layout: layouts/post.njk
---

## Why it is hard?

Euro Track Simulator 2 have support for multiscreen, but with limitations. It works only for at least 3 monitors and aspect ratio at least 2:5.1. More informations are in [oficial documentation](https://eurotrucksimulator2.com/multimon_config.php).

I want to run it on 2 monitors only, and some stupid game will put any limitations on me? I don't think so.

### My setup

My station is Arch Linux, game is installed with Steam, It's native Linux implementation. I'm using Xorg as my X server and I3wm as window manager. More or less usual Linux setup. Screens that I want to use for game are 2560x1440.

### Methodology

With `xrand` I can [combine two monitors into one](https://wiki.archlinux.org/title/multihead###Combine_screens_into_virtual_display). This way game will think that I'm playing it on wide screen.

First I need to identify displays that I have to disposition.

```bash
$> xrandr --listmonitors
Monitors: 3
 0: +*DisplayPort-1 2560/597x1440/336+0+1080  DisplayPort-1
 1: +DisplayPort-0 2560/597x1440/336+2560+1080  DisplayPort-0
 2: +HDMI-A-0 1920/575x1080/323+965+0  HDMI-A-0
```

I want to use `DisplayPort-1` and `DisplayPort-0`. I'll name my new screen as `DP-1_and_DP-0`. Name for newly created screen is arbitrary, but it is used for reversing process. Effect of that command will be instantaneously.

```bash
$> xrandr --setmonitor DP-1_and_DP-0 auto DisplayPort-1,DisplayPort-0
```

Let's check again list of monitors that are available for us.

```bash
$> xrandr --listmonitors
Monitors: 2
 0: DP-1_and_DP-0 5120/597x1440/336+0+1080  DisplayPort-1 DisplayPort-0
 1: +HDMI-A-0 1920/575x1080/323+965+0  HDMI-A-0
```

It's worth to notice new resolution for new monitor, that in that example is `5120x1440`.
Unfortunately in game options there are only predefined screen resolution's. Lucky for us there is config file will give us access to settings that are not presented in game UI.
For Linux user file path is `~/.local/share/Euro\ Truck\ Simulator\ 2/confiig.cfg` and for Windows users... I don't care.

Resolution can be set under those obvious setting names.

```bash
uset r_mode_height "1440"
uset r_mode_width "5120"
```

Full process should not take more than half a minute. Restarting game will probably take longer.

### Reversing dual screen

To reverse it, simply delete monitor that was created.

```bash
$> xrandr --listmonitors
Monitors: 2
 0: DP-1_and_DP-0 5120/597x1440/336+0+1080  DisplayPort-1 DisplayPort-0
 1: +HDMI-A-0 1920/575x1080/323+965+0  HDMI-A-0
```

In this example it's `DP-1_and_DP-0`. Full command will be:

```bash
$> xrandr --delmonitor DP-1_and_DP-0
```

Result will be immediate. Just out of curiosity, listing monitors to see that everything is back to state from before.

```bash
$> xrandr --listmonitors
Monitors: 3
 0: +*DisplayPort-1 2560/597x1440/336+0+1080  DisplayPort-1
 1: +DisplayPort-0 2560/597x1440/336+2560+1080  DisplayPort-0
 2: +HDMI-A-0 1920/575x1080/323+965+0  HDMI-A-0
```
