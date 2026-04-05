---
title: Insta360 Fix corrupted SD card
description: Common problem when downloading files from insta360,  ERROR invalid VBR checksum 0x1f918e82 expected 0xa0fc47d0
date: 2024-06-19
tags: video, linux, insta360, datarecovery
    - post
layout: layouts/post.njk
---


Once I've [posted on X](https://x.com/undg__/status/1779947010524901822) about how easy it is to recover data from a corrupted card. I know it's a stretch to say it's always true, but I want to document this simple process for future self. It has happened to me more than once. More than twice. In fact, I don't remember how many times it has happened.

## Diagnostic

When downloading files from Insta360 with a USB cable, the drive suddenly disconnects. After running the `lsblk` command, you will see only the drive, but no partition.

```bash
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0         7:0    0     4K  1 loop /var/lib/snapd/snap/bare/5
loop1         7:1    0   572K  1 loop /var/lib/snapd/snap/color-picker/26
loop2         7:2    0  63.9M  1 loop /var/lib/snapd/snap/core20/2105
loop3         7:3    0  63.9M  1 loop /var/lib/snapd/snap/core20/2182
loop4         7:4    0  74.2M  1 loop /var/lib/snapd/snap/core22/1122
loop5         7:5    0   2.1M  1 loop /var/lib/snapd/snap/cozy/10
loop6         7:6    0   497M  1 loop /var/lib/snapd/snap/gnome-42-2204/141
loop7         7:7    0  91.7M  1 loop /var/lib/snapd/snap/gtk-common-themes/1535
loop8         7:8    0 301.4M  1 loop /var/lib/snapd/snap/qt5-core20/16
loop9         7:9    0  40.4M  1 loop /var/lib/snapd/snap/snapd/20671
sda           8:0    1   1.8T  0 disk
└─sda1        8:1    1   1.8T  0 part /mnt/s1
sdb           8:16   0   5.5T  0 disk
└─sdb1        8:17   0   5.5T  0 part /mnt/s2
sdc           8:32   1     0B  0 disk            ########## <----- THIS ONE!!!!!!!!
sde           8:64   1 117.8G  0 disk
└─sde1        8:65   1 117.7G  0 part /run/media/undg/F2_SD
zram0       254:0    0     4G  0 disk [SWAP]
nvme2n1     259:0    0 931.5G  0 disk
└─nvme2n1p1 259:1    0 931.5G  0 part /home
nvme0n1     259:2    0 931.5G  0 disk
└─nvme0n1p1 259:3    0 931.5G  0 part /mnt/s0
nvme1n1     259:4    0 223.6G  0 disk
├─nvme1n1p1 259:5    0   512M  0 part /boot
└─nvme1n1p2 259:6    0 223.1G  0 part /
```

Remove the card from the Insta360 and connect it to a card reader. (It may work in the Insta360, but I don't know.)

Now you should see the partition, but without any MOUNTPOINTS. I'm auto-mounting, but the same applies if you mount it manually as in X post.

```bash
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0         7:0    0     4K  1 loop /var/lib/snapd/snap/bare/5
loop1         7:1    0   572K  1 loop /var/lib/snapd/snap/color-picker/26
loop2         7:2    0  63.9M  1 loop /var/lib/snapd/snap/core20/2105
loop3         7:3    0  63.9M  1 loop /var/lib/snapd/snap/core20/2182
loop4         7:4    0  74.2M  1 loop /var/lib/snapd/snap/core22/1122
loop5         7:5    0   2.1M  1 loop /var/lib/snapd/snap/cozy/10
loop6         7:6    0   497M  1 loop /var/lib/snapd/snap/gnome-42-2204/141
loop7         7:7    0  91.7M  1 loop /var/lib/snapd/snap/gtk-common-themes/1535
loop8         7:8    0 301.4M  1 loop /var/lib/snapd/snap/qt5-core20/16
loop9         7:9    0  40.4M  1 loop /var/lib/snapd/snap/snapd/20671
sda           8:0    1   1.8T  0 disk
└─sda1        8:1    1   1.8T  0 part /mnt/s1
sdb           8:16   0   5.5T  0 disk
└─sdb1        8:17   0   5.5T  0 part /mnt/s2
sdc           8:32   1 233.2G  0 disk            ########## <----- THIS ONE!!!!!!!!
└─sdc1        8:33   1 233.2G  0 part            ########## <----- THIS ONE!!!!!!!!
sde           8:64   1 117.8G  0 disk
└─sde1        8:65   1 117.7G  0 part /run/media/undg/F2_SD
zram0       254:0    0     4G  0 disk [SWAP]
nvme2n1     259:0    0 931.5G  0 disk
└─nvme2n1p1 259:1    0 931.5G  0 part /home
nvme0n1     259:2    0 931.5G  0 disk
└─nvme0n1p1 259:3    0 931.5G  0 part /mnt/s0
nvme1n1     259:4    0 223.6G  0 disk
├─nvme1n1p1 259:5    0   512M  0 part /boot
└─nvme1n1p2 259:6    0 223.1G  0 part /
```

If you try to mount manually, you will get an error.

```bash
❯ sudo mount -t exfat /dev/sdc1 /run/media/undg/INSTA360-X3
FUSE exfat 1.4.0 (libfuse3)
ERROR: invalid VBR checksum 0x1f918e82 (expected 0xa0fc47d0) ##### hex may vary
```

## FIX

Use `exfatfsck` utility that will diagnose this problem and will ask you if you want to repair it:

```bash
❯ sudo exfatfsck /dev/sdc1
exfatfsck 1.4.0
Checking file system on /dev/sdc1.
ERROR: invalid VBR checksum 0x1f918e82 (expected 0xa0fc47d0).
Fix (Y/N)? Y
WARN: volume was not unmounted cleanly.
File system version           1.0
Sector size                 512 bytes
Cluster size                128 KB
Volume size                 233 GB
Used space                   45 GB
Available space             188 GB
Totally 3 directories and 7 files.
File system checking finished. ERRORS FOUND: 1, FIXED: 1.
```

Now you can mount it and check again with `lsblk` to see if the partition is there.


```bash
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0         7:0    0     4K  1 loop /var/lib/snapd/snap/bare/5
loop1         7:1    0   572K  1 loop /var/lib/snapd/snap/color-picker/26
loop2         7:2    0  63.9M  1 loop /var/lib/snapd/snap/core20/2105
loop3         7:3    0  63.9M  1 loop /var/lib/snapd/snap/core20/2182
loop4         7:4    0  74.2M  1 loop /var/lib/snapd/snap/core22/1122
loop5         7:5    0   2.1M  1 loop /var/lib/snapd/snap/cozy/10
loop6         7:6    0   497M  1 loop /var/lib/snapd/snap/gnome-42-2204/141
loop7         7:7    0  91.7M  1 loop /var/lib/snapd/snap/gtk-common-themes/1535
loop8         7:8    0 301.4M  1 loop /var/lib/snapd/snap/qt5-core20/16
loop9         7:9    0  40.4M  1 loop /var/lib/snapd/snap/snapd/20671
sda           8:0    1   1.8T  0 disk
└─sda1        8:1    1   1.8T  0 part /mnt/s1
sdb           8:16   0   5.5T  0 disk
└─sdb1        8:17   0   5.5T  0 part /mnt/s2
sdc           8:32   1 233.2G  0 disk                                        ########## <----- THIS ONE!!!!!!!!
└─sdc1        8:33   1 233.2G  0 part /run/media/undg/INSTA360-X3            ########## <----- THIS ONE!!!!!!!!
sde           8:64   1 117.8G  0 disk
└─sde1        8:65   1 117.7G  0 part /run/media/undg/F2_SD
zram0       254:0    0     4G  0 disk [SWAP]
nvme2n1     259:0    0 931.5G  0 disk
└─nvme2n1p1 259:1    0 931.5G  0 part /home
nvme0n1     259:2    0 931.5G  0 disk
└─nvme0n1p1 259:3    0 931.5G  0 part /mnt/s0
nvme1n1     259:4    0 223.6G  0 disk
├─nvme1n1p1 259:5    0   512M  0 part /boot
└─nvme1n1p2 259:6    0 223.1G  0 part /
```

Tada 🎊

