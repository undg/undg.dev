---
title: Archlinux installation
description: Installation is pretty strait forward. Log of post installation steps.
date: 2023-09-03
tags: linux, archlinux, btw
    - post
layout: layouts/post.njk
---

Installation of archlinux is rather simple and straightforward task. You have control over every important aspect, and you are less likely to face some "magical" problems.

Post install process is more challenging, due to do it once nature. Last time I've reinstalled Arch from scratch was about 5-6y ago. I don't remember what I've changed in the system from that time. Bellow is my log of what I've done this time. I'll (at least try) update it with all steps necessary to bring back all features I previously got. This is my personal setup that works with my dotfiles.

## Easy part, no brainer
* Download latest iso from https://archlinux.org/
* Burn iso on pen with https://etcher.balena.io/
* boot from pendrive
* Prepare one clean partition with `fdisk` or any other utility of your choice. I'm choosing whole 250gb drive. It's overkill, but large padding of free space, have drive health benefits.
* https://wiki.archlinux.org/title/archinstall or do it manually following https://wiki.archlinux.org/title/installation_guide . With archinstall, you can save all steps, and use them later with `archinstall --config` flag.
* For audio pipewire looks like solid solution. Don't forget about pipewire-pulse adapter in post install.
* If you have `home` on separate partition, ignore it for now. It can be mounted in post install.
* Finish installation.

## Post installation
* `chroot` to new system while still in live iso.
* Install few packages. Some of the can be in aur. I like `yay` as as `pacman` wrapper with aur support.
* Install `yay` (bin version compiled on gh-actions, you can compile it yourself if)

```bash
pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin
makepkg -si
```

* This is list of my essential packages to start with:

Written by hand
```bash
alacritty
arandr
audacity
brave-bin
cmatrix
composer
curl
downgrade
dunst
etcher-bin
exa
fasd
fd
fping
fzf
git
htop
i3blocks
jq
julia
kitty
kodi
lazygit
luarocks
nemo
neovim
noto-fonts-emoji
openssh
pavucontrol
pipewire
pipewire-pulse
prettierd
python-pynvim
ranger
reflector
ripgrep
rofi
rofi-calc
rofi-emoji
rsync
rtx
rubygems
rust
sddm
sddm-archlinux-theme-git
stow
the_silver_searcher
tig
tmux
translate-shell
trash-cli
tree-sitter
tree-sitter-cli
wget
xclip
xsel
zsh
zsh-theme-powerlevel10k-git
```



`pacman -Qm | awk '{print $1}'`

```bash
brave-bin
downgrade
etcher-bin
iriunwebcam-bin
microsoft-edge-stable-bin
prettierd
rtx
sddm-archlinux-theme-git
yay-git
zsh-theme-powerlevel10k-git
```

`pacman -Qm | awk '{print $1}'`

```bash
alacritty
amd-ucode
arandr
audacity
base
base-devel
cmatrix
composer
dunst
efibootmgr
exa
fasd
fd
flameshot
flatpak
fping
git
git-delta
github-cli
gst-plugin-pipewire
hq
htop
i3-wm
i3blocks
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
man-db
nemo
neovim
noto-fonts-emoji
npm
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
sddm
stow
the_silver_searcher
tig
tmux
translate-shell
trash-cli
tree-sitter-cli
ttf-mononoki-nerd
unzip
vulkan-radeon
wget
wireplumber
xclip
xf86-video-amdgpu
xf86-video-ati
xorg-server
xorg-xinit
yarn
zram-generator
zsh
```

* all nerd-fonts:

`sudo pacman -S $(pacman -Sgq nerd-fonts)`

#### I have home in separate partition and cloned drive:
* Remove content of current `home` directory (small temporary backup is always good practice, for fresh install not necessary and if you know what you doing).
* Mount partition with your `old home partition` to current one. Save it in `/ets/fstab`. For me it was just copy paste fstab from old os to new (backup with rsync FTW). Don't forgotten that uuids for recreated partitions will change. If you are using disk location (sda1, sdb1, nvme0n1, ...), they need to be connected to same sockets in motherboard. `lsblk` is your friend to check that, `sudo fdisk -l` if you need more info (including uuids), another option is `blkid`, and my favorite `ls -lha /dev/disk/by-uuid`.
* If you have separate partitions for var, log, whatever, repeat that process.
* Enjoy your fresh install for another couple of years.

### Iriun webcam for Linux
I cant justify buying crappy webcam, when I have good one in my phone.

```bash
yay iriunwebcam-bin

# install and enable kernel module

sudo pacman -S linux-headers v4l2loopback-dkms
modprobe v4l2loopback
sudo rmmod v4l2loopback; sudo modprobe v4l2loopback
```
