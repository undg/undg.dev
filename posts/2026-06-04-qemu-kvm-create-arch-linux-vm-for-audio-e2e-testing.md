---
title: "QEMU KVM - Create Arch Linux VM for Audio E2E Testing"
description: "Set up KVM-accelerated QEMU virtual machines on Arch Linux with both PipeWire and PulseAudio environments for reliable audio end-to-end testing."
date: 2026-06-04
tags:
    - post
    - linux
    - arch
    - testing
    - virtualisation
    - kvm
    - qemu
    - audio
    - e2e
    - pipewire
    - pulseaudio

layout: layouts/post.njk
---

This guide has two parts: first, setting up QEMU with KVM acceleration on your host machine. Second, creating and configuring Arch Linux VM images for testing audio applications.

I use QEMU because it's fast with KVM and trivial to run from the command line — no GUI, no complexity, just scriptable VMs.

## Table of Contents

- [Installation and setting up QEMU](#installation-and-setting-up-qemu)
- [Creating Arch Linux VM for Audio E2E Testing](#creating-arch-linux-vm-for-audio-e2e-testing)
    - [1. Create Base Disk Image](#1.-create-base-disk-image)
    - [2. Boot the ISO and Install Arch](#2.-boot-the-iso-and-install-arch)
    - [3. Post Install Configuration](#3.-post-install-configuration)
    - [4. Freeze Base Image and Create Test Snapshot](#4.-freeze-base-image-and-create-test-snapshot)
    - [5. Launch for Testing](#5.-launch-for-testing)
    - [Resetting Test State](#resetting-test-state)
- [Quick QEMU Command Reference](#quick-qemu-command-reference)

## Installation and setting up QEMU

Install QEMU:

```bash
sudo pacman -S qemu-full
```

**1. CPU support** — check with:

```bash
LC_ALL=C lscpu | grep -i virtualization
# Should show: VT-x (Intel) or AMD-V (AMD)
```

**2. Kernel modules** — load and persist:

```bash
sudo modprobe kvm
sudo modprobe kvm_intel   # Intel
# OR
sudo modprobe kvm_amd     # AMD

# Persist after reboot:
echo "kvm" | sudo tee /etc/modules-load.d/kvm.conf
echo "kvm_amd" | sudo tee -a /etc/modules-load.d/kvm.conf  # for AMD
#echo "kvm_intel" | sudo tee -a /etc/modules-load.d/kvm.conf  # adjust for INTEL
```

**3. User permissions** — add yourself to the group:

```bash
sudo usermod -aG kvm $USER
# Log out and back in for group to apply
```

**4. Verify it works:**

```bash
ls -la /dev/kvm          # Should exist and be owned by kvm group
qemu-system-x86_64 -accel kvm -hda /dev/null  # Should start without "falling back to tcg" warning
```

## Creating Arch Linux VM for Audio E2E Testing

### 1. Create Base Disk Image

```bash
qemu-img create -f qcow2 arch-audio-base.qcow2 10G
```

Download the Arch ISO (check archlinux.org/download for current version):

```bash
# HTTP download from geo mirror
curl -O https://geo.mirror.pkgbuild.com/iso/latest/archlinux-x86_64.iso

# OR use BitTorrent (recommended by Arch, helps reduce mirror load):
# curl -O https://archlinux.org/releng/releases/latest/torrent/
# Then open the .torrent file with your client (transmission, qbittorrent, etc.)
```

Verify the ISO signature (optional but recommended):

```bash
# Download signature and checksums
curl -O https://geo.mirror.pkgbuild.com/iso/latest/sha256sums.txt
curl -O https://geo.mirror.pkgbuild.com/iso/latest/sha256sums.txt.sig

# Verify checksum matches
sha256sum -c sha256sums.txt --ignore-missing

# Verify PGP signature (requires archlinux-keyring installed)
gpg --verify sha256sums.txt.sig sha256sums.txt
```

### 2. Boot the ISO and Install Arch

Start the VM with the ISO mounted for installation:

```bash
qemu-system-x86_64 \
  -accel kvm \
  -m 2G \
  -cdrom archlinux-x86_64.iso \
  -hda arch-audio-base.qcow2 \
  -boot d
```

This opens a normal window where you can run through the Arch installer. Follow the [Arch installation guide](https://wiki.archlinux.org/title/Installation_guide) with these choices:

|  #  | Setting        | Selection              | Notes                                                   |
| :-: | :------------- | :--------------------- | :------------------------------------------------------ |
|  0  | **Disk**       | 10GB btrfs             | zstd compression, flat layout (no subvolumes), skip LVM |
|  1  | **Swap**       | Skip                   | 2GB RAM is sufficient                                   |
|  2  | **Bootloader** | Limine                 | Modern, handles btrfs natively                          |
|  3  | **Kernel**     | Standard `linux`       | Not LTS or Zen                                          |
|  4  | **User**       | `pr` / `pr`            | Create user `pr` with password `pr`                     |
|  5  | **Profile**    | Minimal                | No desktop environment needed                           |
|  6  | **Network**    | Copy ISO configuration | systemd-networkd with DHCP                              |
|  7  | **Audio**      | PipeWire               | Enable PipeWire user services after first boot          |
|  8  | **Firewall**   | UFW                    | Disable it in post install; VM is NAT isolated          |

**Additional packages to install:**

```bash
# Base system
base base-devel linux linux-firmware

# Testing essentials
openssh neovim curl git wget btop jq zip unzip alsa-utils libpulse pulsemixer openssh
```

### 3. Post Install Configuration

Before freezing the base image, configure the system for automated testing. Boot the newly installed system (not the ISO) and run:

```bash
qemu-system-x86_64 -accel kvm \
  -m 2G \
  -hda arch-audio-base.qcow2 \
  -audiodev pa,id=snd0 \
  -device intel-hda \
  -device hda-duplex,audiodev=snd0 \
  -nic user,hostfwd=tcp::2222-:22
```

1. Enable SSH server

```bash
sudo systemctl enable --now sshd
```

2. Disable Firewall

```bash
sudo ufw disable
```

```bash
systemctl enable serial-getty@ttyS0.service
```

3. Optional: passwordless sudo for automated testing

```bash
echo "pr ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/pr
```

4. Verify audio is working

```bash
pactl info | grep "Server Name"  # Should show "PulseAudio (on PipeWire)"
# Enable PipeWire if it's not working
# systemctl --user enable --now pipewire pipewire-pulse wireplumber
```

5. Reduce bootloader timeout (Limine)

Edit the Limine configuration to speed up boot:

```bash
sudo sed -i 's/timeout:.*/timeout: 0/' /boot/limine/limine.conf
```

6. Power off to freeze the base image

```bash
poweroff
```

### 4. Freeze Base Image and Create Test Snapshot

After configuration, shut down and protect the base image from accidental writes. QCOW2 snapshots reference specific block offsets in the backing file — modifying the base after creating snapshots corrupts the chain.

```bash
chmod 444 arch-audio-base.qcow2
```

Create a derived snapshot for testing:

```bash
qemu-img create -f qcow2 -F qcow2 -b arch-audio-base.qcow2 arch-test-pipewire.qcow2
```

### 5. Launch for Testing

The VM will automatically log in as user `pr`. You can immediately run audio tests, or SSH into it:

```bash
# Start the VM
qemu-system-x86_64 -accel kvm -m 2G -hda arch-test-pipewire.qcow2 \
  -audiodev pa,id=snd0 -device intel-hda -device hda-duplex,audiodev=snd0 \
  -display none -serial stdio \
  -nic user,hostfwd=tcp::2222-:22

# From another terminal, SSH into the VM
ssh -p 2222 pr@localhost
```

### Resetting Test State

Snapshots are copy-on-write. To reset to clean state, delete and recreate:

```bash
rm arch-test-pipewire.qcow2
qemu-img create -f qcow2 -F qcow2 -b arch-audio-base.qcow2 arch-test-pipewire.qcow2
```

## Quick QEMU Command Reference

Once you have a working VM image, here's a quick template to launch it with audio and SSH support:

```bash
qemu-system-x86_64 \
  -accel kvm \
  -m 2G \
  -hda arch-vm.img \
  -audiodev pa,id=snd0 \                   # PulseAudio backend
  -device intel-hda -device hda-duplex,audiodev=snd0 \  # Audio device
  -display none \
  -serial stdio \
  -nic user,hostfwd=tcp::2222-:22         # SSH on port 2222
```

Connect via SSH: `ssh -p 2222 pr@localhost`

The `-accel kvm` flag is what makes it fast. Without it, QEMU silently falls back to TCG.
