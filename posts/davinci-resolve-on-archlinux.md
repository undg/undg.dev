---
title: Install DaVinci Resolve on Linux
description: Installation done on Arch Linux with Radeon RX 5700 XT
date: 2023-12-22
tags: linux, archlinux, btw, video
    - post
layout: layouts/post.njk
---

For video editing, I was using Lightworks. It's fine, but I'm looking for something more sophisticated. I don't like timeline editing and the way you interact with it. There is always the same dropdown menu that can change depending on the context. The context is very unclear to me. I don't know when I should have what in that menu. It was cool to start with it, installation is easy, and basic editing is way easier than in Kdenlive. Well-spent money for the license.

Installing DaVinci Resolve on Linux can be a bit tricky. You need to have a dedicated graphics card. This installation guide is for my own needs. Let's check what we've got.

## Graphics card

```bash
$> lspci | grep -i vga

09:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Navi 10 [Radeon RX 5600 OEM/5600 XT / 5700/5700 XT] (rev c1)
```

## Linux kernel

```bash
$> uname -a
Linux cm 6.6.7-arch1-1 #1 SMP PREEMPT_DYNAMIC Thu, 14 Dec 2023 03:45:42 +0000 x86_64 GNU/Linux
```

## DaVinci Resolve version

```bash
pacman -Qs davinci-resolve
local/davinci-resolve 18.6.4-1
```

## Useful links

https://wiki.archlinux.org/title/DaVinci_Resolve


## Activate License problem

https://forum.blackmagicdesign.com/viewtopic.php?f=21&t=142281#p834190

```bash
sudo chmod 777 /opt/resolve/.license
```
or

```bash
sudo chown -R undg/opt/resolve
```

## GPU error code: -1

1. Open any project -> Preferences -> memory and GPU
2. Set `GPU processing mode` and `GPU selection` to manual

I'm not sure if it was auto GPU or auto OpenCL but currently I have set this to:

- mode: OpenCL
- GPU: Main display (Details column)

![davinci-resolve manual setting for GPU](/img/davinci-manual-gpu-fix-thumb.png)

