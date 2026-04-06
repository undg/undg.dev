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

This guide has two parts: first, setting up QEMU with KVM acceleration on your host machine. Second, creating and configuring Arch Linux VM images for testing audio applications against both PipeWire and PulseAudio environments.

I use QEMU because it's fast with KVM and trivial to run from the command line — no GUI, no complexity, just scriptable VMs.

## Table of Contents

- [Installation and setting up QEMU](#installation-and-setting-up-qemu)
- [Creating Arch Linux VM for Audio E2E Testing](#creating-arch-linux-vm-for-audio-e2e-testing)
  - [1. Create Base Disk Image](#1-create-base-disk-image)
  - [2. Boot the ISO and Install Arch](#2-boot-the-iso-and-install-arch)
  - [3. Create Test Snapshots](#3-create-test-snapshots)
  - [4. Configure Each Environment](#4-configure-each-environment)
  - [5. Launch for Testing](#5-launch-for-testing)
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

This opens a normal window where you can run through the Arch installer. Follow the [Arch installation guide](https://wiki.archlinux.org/title/Installation_guide). When selecting packages, include:

```bash
# Base system
base base-devel linux linux-firmware vim

# Both audio systems
pipewire pipewire-pulse pipewire-alsa wireplumber \
pulseaudio pulseaudio-alsa alsa-utils
```

**Do not enable any audio services yet** — we'll configure per snapshot.

### 3. Create Test Snapshots

After installation, shut down and create two derived images:

```bash
# PipeWire test environment
qemu-img create -f qcow2 -b arch-audio-base.qcow2 arch-test-pipewire.qcow2

# PulseAudio test environment
qemu-img create -f qcow2 -b arch-audio-base.qcow2 arch-test-pulse.qcow2
```

### 4. Configure Each Environment

**PipeWire snapshot:**

```bash
# Inside VM booted from arch-test-pipewire.qcow2
systemctl --user enable --now pipewire pipewire-pulse wireplumber
# Verify: pactl info | grep "Server Name" should show "PulseAudio (on PipeWire)"
```

**PulseAudio snapshot:**

```bash
# Inside VM booted from arch-test-pulse.qcow2
systemctl --user enable --now pulseaudio.socket pulseaudio.service
# Verify: pactl info | grep "Server Name" should show "pulseaudio"
```

### 5. Launch for Testing

```bash
# PipeWire test
qemu-system-x86_64 -accel kvm -m 2G -hda arch-test-pipewire.qcow2 \
  -audiodev pa,id=snd0 -device intel-hda -device hda-duplex \
  -display none -serial stdio

# PulseAudio test
qemu-system-x86_64 -accel kvm -m 2G -hda arch-test-pulse.qcow2 \
  -audiodev pa,id=snd0 -device intel-hda -device hda-duplex \
  -display none -serial stdio
```

### Resetting Test State

Snapshots are copy-on-write. To reset to clean state, delete and recreate:

```bash
rm arch-test-pipewire.qcow2
qemu-img create -f qcow2 -b arch-audio-base.qcow2 arch-test-pipewire.qcow2
```

## Quick QEMU Command Reference

Once you have a working VM image, here's a quick template to launch it with audio support:

```bash
qemu-system-x86_64 \
  -accel kvm \
  -m 2G \
  -hda arch-vm.img \
  -device intel-hda -device hda-duplex \  # Audio device
  -audiodev pa,id=snd0 \                  # PulseAudio backend
  -display none \
  -serial stdio
```

The `-accel kvm` flag is what makes it fast. Without it, QEMU silently falls back to TCG.
