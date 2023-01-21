
---
title: Auto connect BT
description: Auto connect bt keyboard in TTY1 (before graphical interface)
date: 2023-01-11
tags: linux, bluetooth, keyboard
    - post
layout: layouts/post.njk
---

## My login screen

Call me weirdo, but my favorite login manager is simple default TTY1. For that reason I can't rely on fancy GUI tools. Usually I'm using blueman for managing Bluetooth devices, but blutoothctl is fine from time to time.

## Preparation
For some reason I need to reload two kernel modules `btusb` and `btintel`. To do that before login, I'm creating modprobe file with that content.

path: `/etc/modprobe.d/bluetooth.conf`
```sh
rmmod btusb
rmmod btintel
modprobe btusb
modprobe btintel
```

After that in `/etc/bluetooth/main.conf` In section `[Policy]` I've uncommented line
```toml
AutoEnable=true
```

After that I can reboot PC and my keyboard is connected way before anything else is turned on.

## Post note
Keyboard need to be paired and trusted. If it's not, there is no problem to do it remotely via ssh. Here are steps in bluetoothctl:

```sh
bluetoothctl power on
bluetoothctl agent KeyboardOnly
bluetoothctl pairable on
bluetoothctl scan on
# check scan for kbd mac addr
bluetoothctl pair 01:01:01:01:01:01:
bluetoothctl trust 01:01:01:01:01:01:
bluetoothctl connect 01:01:01:01:01:01:

# optionally to save power, f.e. on laptop
bluetoothctl scan off
```

Same thing can be done in any GUI tool.

