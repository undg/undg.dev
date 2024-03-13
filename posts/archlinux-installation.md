---
title: Archlinux installation
description: Installation is pretty strait forward. Log of post installation steps.
date: 2023-09-03
tags: linux, archlinux, btw
    - post
layout: layouts/post.njk
---

Installation of Arch Linux is a rather simple and straightforward task. You have control over every important aspect, and you are less likely to face some "magical" problems.

The post-install process is more challenging, due to its "do it once" nature. The last time I reinstalled Arch from scratch was about 5-6 years ago. I don't remember what changes I've made to the system since then. Below is my log of what I've done this time. I'll (at least try to) update it with all the steps necessary to bring back all the features I previously had. This is my personal setup that works with my [dotfiles](https://github.com/undg/.dot).

## Easy part, no brainer

-   Download the latest ISO from https://archlinux.org/
-   Burn the ISO onto a pen drive with https://etcher.balena.io/
-   Boot from the pen drive
-   Prepare one clean partition with `fdisk` or any other utility of your choice. I'm choosing the whole 250GB drive. It's overkill, but a large padding of free space has drive health benefits.
-   Use https://wiki.archlinux.org/title/archinstall or do it manually following https://wiki.archlinux.org/title/installation_guide. With archinstall, you can save all steps and use them later with the `archinstall --config` flag.
-   For audio, Pipewire looks like a solid solution. Don't forget about the pipewire-pulse adapter in post-install.
-   If you have `home` on a separate partition, ignore it for now. It can be mounted in post-install.
-   Finish the installation.

## Post installation

-   `chroot` into the new system while still in the live ISO.
-   Install a few packages. Some of them can be in AUR. I like `yay` as a `pacman` wrapper with AUR support.
-   Install `yay` (bin version compiled on GH Actions, you can compile it yourself if)

```bash
pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin
makepkg -si
```

#### Edit `/etc/pacman.conf`

If you want to enable testing repo's enable all of them (including mesa-git for AMD gpu)

```ini
# Misc options
UseSyslog
Color
CheckSpace
VerbosePkgLists
ParallelDownloads = 12
DisableDownloadTimeout
ILoveCandy

# (...)
# The testing repositories are disabled by default. To enable, uncomment the
# repo name header and Include lines. You can add preferred servers immediately
# after the header, and they will be used before the default mirrors.

#[core-testing]
#Include = /etc/pacman.d/mirrorlist


[core]
Include = /etc/pacman.d/mirrorlist

#[extra-testing]
#Include = /etc/pacman.d/mirrorlist

[extra]
Include = /etc/pacman.d/mirrorlist

# If you want to run 32 bit applications on your x86_64 system,
# enable the multilib repositories as required here.

#[multilib-testing]
#Include = /etc/pacman.d/mirrorlist

[multilib]
Include = /etc/pacman.d/mirrorlist

# Maintainer: [Laurent Carlier](https://archlinux.org/people/trusted-users/#lcarlier)
# Description: Mesa git builds for the testing repositories
#[mesa-git]
#Server = https://pkgbuild.com/~lcarlier/$repo/$arch

```

#### Installed from AUR (`-m` not found in repo db)

```bash
pacman -Qm | awk '{print $1}'
```

```bash

brave-bin
downgrade
etcher-bin
htop-vim
i3blocks-contrib-git
iriunwebcam-bin
microsoft-edge-stable-bin
nodejs-cspell
prettierd
rtx
sddm-archlinux-theme-git
volctl
vmware-workstation
yay-git
zsh-theme-powerlevel10k-git

```

#### Installed from official repo (`-n` found in repo db, `-e` explicitly installed)

```bash
pacman -Qne | awk '{print $1}'
```

```bash

alacritty
amd-ucode
arandr
atuin
audacity
barrier
base
base-devel
blueman
bluez
bluez-utils
cmatrix
composer
dunst
efibootmgr
eza
fasd
fd
feh
flameshot
flatpak
fping
git
git-delta
github-cli
gst-plugin-pipewire
hq
i3-wm
i3blocks
i3lock
imagemagick
inetutils
jq
julia
kitty
kodi
lazygit
libnotify
libpulse
libva-mesa-driver
linux
linux-firmware
linux-headers
linux-zen
luarocks
lxqt-policykit-agent
man-db
mpv
nemo
nemo-fileroller
neovim
network-manager-applet
networkmanager
noto-fonts-emoji
npm
obs-studio
openssh
otf-aurulent-nerd
otf-codenewroman-nerd
otf-comicshanns-nerd
otf-droid-nerd
otf-firamono-nerd
otf-hasklig-nerd
otf-hermit-nerd
otf-opendyslexic-nerd
otf-overpass-nerd
pavucontrol
picom
pipewire
pipewire-alsa
pipewire-jack
pipewire-pulse
polkit
polkit-qt5
python-pip
python-pynvim
ranger
reflector
ripgrep
rofi
rofi-calc
rofi-emoji
rsync
ruby
rust
scrot
sddm
stow
the_silver_searcher
tig
timeshift
tmux
translate-shell
trash-cli
tree-sitter-cli
ttf-mononoki-nerd
unzip
vlc
vulkan-radeon
wget
wireplumber
xclip
xf86-video-amdgpu
xf86-video-ati
xkill
xorg-server
xorg-xinit
yarn
zram-generator
zsh

```

#### I have a home in a separate partition and cloned drive:

-   Remove content of the current `home` directory (a small temporary backup is always good practice. Not necessary for a fresh install and if you know what you're doing).
-   Mount the partition with your `old home partition` to the current one. Save it in `/etc/fstab`. For me, it was just copy-pasting fstab from the old OS to the new (backup with rsync FTW). Don't forget that UUIDs for recreated partitions will change. If you are using disk location (sda1, sdb1, nvme0n1, ...), they need to be connected to the same sockets on the motherboard. `lsblk` is your friend to check that, `sudo fdisk -l` if you need more info (including UUIDs), another option is `blkid`, and my favorite `ls -lha /dev/disk/by-uuid`.
-   If you have separate partitions for var, log, whatever, repeat that process.
-   Enjoy your fresh install for another couple of years.

#### Iriun webcam for Linux

I can't justify buying a crappy webcam when I have a good one on my phone.

```bash
yay -S iriunwebcam-bin

# install and enable kernel module

sudo pacman -S linux-headers v4l2loopback-dkms
modprobe v4l2loopback
sudo rmmod v4l2loopback; sudo modprobe v4l2loopback
```

#### NetworkManager

`networkctl` (from `systemd-networkd.service`) is perfectly fine for server configuration. For a desktop experience, though, we want to use `NetworkManager` that can be used by a few GUI tools. Most important for me is the system tray icon with network status.

Make sure that you have installed:

```bash
sudo pacman -S networkmanager network-manager-applet
```

Stop and disable the systemd-networkd service, then enable and start the service from NetworkManager. Never run them both at the same time.

```bash
sudo systemctl disable systemd-networkd.service
sudo systemctl stop systemd-networkd.service

sudo systemctl enable NetworkManager.service
sudo systemctl start NetworkManager.service
```

Run `nm-applet` for the tray icon, or `nmcli help` for a more user-friendly experience 😁.

#### sshd

Make sure that `openssh` is installed, enabled, and started in systemd.

Find `Port 22` and change it to whatever is not standard.

```bash
sudo nvim /etc/ssh/sshd_config

sudo systemctl restart sshd
```

#### Solve screen tearing

Install a composite manager and play with vsync. My choice is `picom`, [config is in dotfiles](https://github.com/undg/.dot/blob/master/window-manager/.config/picom.conf)

#### Steam

Enable multilib in `/etc/pacman.conf`, sync pacman, and install Steam

```bash
sudo nvim /etc/pacman.conf
```

```ini
[multilib]
Include = /etc/pacman.d/mirrorlist
```

```bash
sudo pacman -Suy
sudo pacman -S steam
```

#### OC and performance

[undg: lm_sensors setup and fixes for Gigabyte B550 AORUS AX V2](/posts/lm_sensors-fix-gigabyte-b550-aorus-ax-v2/)

#### Bluetooth

Install the `bluez` daemon, enable and start `bluetooth.service`.

Install `blueman` (GUI) and `bluez-utils` (CLI `bluetoothctl`) for the frontend.

If needed, enable and connect to trusted devices before Xorg: [undg: Enable Bluetooth keyboard before xstart](/posts/bluetooth-auto-connect-keyboard/)
