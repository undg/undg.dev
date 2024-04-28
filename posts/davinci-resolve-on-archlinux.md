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


# Troubleshooting

Bellow I'll keep log of problems that I've experience over time.

## Activate License problem

https://forum.blackmagicdesign.com/viewtopic.php?f=21&t=142281#p834190


Davinci do not have write access to license file.

Fix it in dumb way:

```bash
sudo chmod 777 /opt/resolve/.license
```

or fix it as it should be fixed

```bash
sudo chown -R undg /opt/resolve # where `undg` is my username
```

## GPU error code: -1

Got this problem in January 2024.

1. Open any project -> Preferences -> memory and GPU
2. Set `GPU processing mode` and `GPU selection` to manual

I'm not sure if it was auto GPU or auto OpenCL but currently I have set this to:

- mode: OpenCL
- GPU: Main display (Details column)

![davinci-resolve manual setting for GPU](/img/davinci-manual-gpu-fix-thumb.png)

## Can't start with error:


```bash
./resolve: symbol lookup error: /usr/lib/libgdk_pixbuf-2.0.so.0: undefined symbol: g_task_set_static_name
```

Got this problem in April 2024.

Problem is caused by incompatible lib `gdk_pixbuf-2` version. I have this problem after update to `2.42.11`.

### Solution 1
Downgrading it to `2.42.10` is my temporary workaround.

In Arch Linux it's as simple as:

```bash
sudo downgrade gdk-pixbuf2
```

Pick 2.42.10 from the list, you may want to add this package to ignored list in pacman

### Solution 2

Another way may be to add lib in this version to resolve lib folder. All, local to davinci-resolve, libs are in `/opt/resolve/libs/*.so`.

### Solution 3
Third solution may be use `LD_PRELOAD` local env var to force use of specific lib:

```bash
LD_PRELOAD="/usr/lib64/libglib-2.0.so /usr/lib64/libgio-2.0.so /usr/lib64/libgmodule-2.0.so" /opt/resolve/bin/resolve
```

Related links:
[gentoo: \[SOLVED\] g_task_set_static_name not present in glib](https://forums.gentoo.org/viewtopic-p-8806845.html?sid=706890537aea9dbdf9507289766610d5)
[reddit: Davinci Resolve doesn't start](https://www.reddit.com/r/archlinux/comments/1c9v09q/davinci_resolve_doesnt_start/)
[reddit: Davinci Resolve 18 Symbol Lookup Error libgdk_pixbuf](https://www.reddit.com/r/voidlinux/comments/12g71x0/davinci_resolve_18_symbol_lookup_error_libgdk/)
