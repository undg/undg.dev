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

## Quick QEMU Command

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

## Creating Arch Linux VM for Audio E2E Testing

### 1. Create Base Disk Image

```bash
qemu-img create -f qcow2 arch-audio-base.qcow2 10G
curl -O https://archlinux.org/iso/latest/archlinux-x86_64.iso
```

### 2. Install Arch with Audio Stack

Boot the ISO and install Arch. When selecting packages, include:

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
