---
title: Setup fans and k10temp on Gigabyte B550 AORUS AX V2
description: Setup and kernel fixes to setup lm_sensors on Gigabyte B550 AORUS ELITE AX V2 motherboard.
date: 2023-09-11
tags: linux, archlinux, mobo, oc, fix
    - post
layout: layouts/post.njk
---


There is few things I had to do to see all sensors and controll them.

* Mobo - Gigabyte B550 AORUS ELITE AX V2 (`sudo dmidecode -t 2`)
* CPU - AMD Ryzen 7 5700X 8-Core Processor (`lscpu`)
* GPU - AMD Radeon RX 5700 XT (`lspci | grep -i vga`)

Install `lm_sensors`, for reading temperature run command `sensors`.

More on:
* https://hwmon.wiki.kernel.org/faq?s%5b%5d=lm_sensors
* https://wiki.archlinux.org/title/lm_sensors

Stress test cpu with `sudo stress --spu 16 --timeout 30`.
Stress test gpu `glmark2`
Adjust fan speed with `coolerControl`.

#### Fixes for Gigabyte B550 AORUS ELITE AX V2.

Install `it87-dkms-git` kernel module from AUR and enable `acpi_enforce_resources=lax` kernel parameter.

As I'm using systemd-boot I need to edit file `/boot/loader/entries/2023-09-02_20-42-48_linux.conf` by adding `acpi_enforce_resources=lax` to end of line with boot `options`

```ini
# Created by: archinstall
# Created on: 2023-09-02_20-42-48
title   Arch Linux (linux)
linux   /vmlinuz-linux
initrd  /amd-ucode.img
initrd  /initramfs-linux.img
options root=PARTUUID=df86fb99-154a-4d14-9e09-74fea3c612ab zswap.enabled=0 rw rootfstype=ext4 acpi_enforce_resources=lax
```

For loading module run.

```bash
modprobe it87
```

To make that change persistent, create two files:

`/etc/modules-load.d/it87.conf`

```ini
it87
```

`/etc/modprobe.d/it87.conf`

```ini
options it87 ignore_resource_conflict=1
```

To fix fan control I have to reload `k10temp` module.

```bash
sudo rmmod k10temp
sudo modprobe k10temp
```

To make that change persistent, force module on boot. Create file:

`/etc/modprobe.d/k10temp.conf`

```ini
# To fix k10temp fan(1,2,3,4,...)
# https://wiki.archlinux.org/title/lm_sensors#K10Temp_module

options k10temp force=1
```

If you are using [coolerControl](https://gitlab.com/coolercontrol/coolercontrol), enable service.

```bash
sudo systemctl enable coolercontrold.service
sudo systemctl start coolercontrold.service
```

For voltage control: [corectrl](https://gitlab.com/corectrl/corectrl)

