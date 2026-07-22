<h1 align="center">
  <img src="lib/icons/applications-utilities-symbolic.svg" width="32" valign="middle" alt="One Extension Icon"/>
  One Extension
</h1>

<p align="center">
  An all-in-one GNOME Shell extension that brings a handful of everyday tools together in one place,
  so you don't need a separate extension for each one.
</p>

<p align="center">
  <a href="https://github.com/pedrolucaslco/gnome-one-extension/releases"><img src="https://img.shields.io/badge/version-1.7.1-blue?style=flat-square" alt="Version"/></a>
  <a href="https://github.com/pedrolucaslco/gnome-one-extension/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0-green?style=flat-square" alt="License"/></a>
  <a href="https://extensions.gnome.org/"><img src="https://img.shields.io/badge/GNOME%20Shell-45%20|%2046%20|%2047%20|%2048%20|%2050-purple?style=flat-square" alt="GNOME Shell"/></a>
</p>

---

## What's inside

### 🪟 Window Centering

Never manually drag a window into place again. One keyboard shortcut (`Alt+Shift+A` by default) centers your
focused window and resizes it to a comfortable percentage of your screen — great for reading, writing, or
just tidying up your desktop. Works across multiple monitors, and every part of it — the shortcut, whether it
moves, resizes, or both, and how much of the screen it should take up — is configurable.

### ⏱️ Stopwatch

A stopwatch that lives in your top bar. Start it from the panel menu and the running time stays visible right
next to the icon, so you always know it's ticking without needing to open anything or keep a browser tab
around just to time something.

### 📊 System Monitor

CPU, RAM, and Disk usage at a glance, right in the panel dropdown — styled with your GNOME accent color so it
always matches your system, not a hardcoded theme. Click the RAM ring to see which apps are using memory and
quit them on the spot, without opening a separate system monitor.

---

## Design

One Extension is built to feel like it belongs in GNOME Shell — not bolted on. It follows the
[GNOME Human Interface Guidelines](https://developer.gnome.org/hig/) for layout, iconography, color, and
interaction patterns, and reuses GNOME's own native controls and theming wherever possible instead of custom
widgets.

## Installation

### Dependencies

- GNOME Shell 45, 46, 47, 48 or 50
- `glib-compile-schemas`

### Via repository (recommended)

```bash
git clone https://github.com/pedrolucaslco/gnome-one-extension.git
cd gnome-one-extension
./install.sh
```

`install.sh` copies the extension into `~/.local/share/gnome-shell/extensions/`, compiles the GSettings
schema, and enables it — no extra setup needed.

### Manual

```bash
glib-compile-schemas schemas/
gnome-extensions install one-extension@pedrolucaslco
gnome-extensions enable one-extension@pedrolucaslco
```

### Updating / uninstalling

```bash
./install.sh              # re-run any time to update after a git pull
./install.sh --status     # check whether it's installed/enabled
./install.sh --uninstall  # disable and remove
```

GNOME Shell only picks up code changes after the extension is reloaded — on X11 that's
`killall -3 gnome-shell`, on Wayland you'll need to log out and back in.

## Development

```bash
# Launch a nested GNOME Shell with the extension installed, for quick iteration
./dev.sh

# Watch live logs
journalctl -f -o cat /usr/bin/gnome-shell
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the version history.

## License

This project is licensed under the GPL-2.0 license — see the [LICENSE](LICENSE) file for details.

## Credits

Developed by [pedrolucaslco](https://github.com/pedrolucaslco)

This project draws on concept, usability, and functionality inspiration from other open source projects:

**Concept**
- [OneMenu](https://coffeebreak.software/one-menu/) (Coffeebreak Software) — product inspiration for macOS: all-in-one extension with Window Manager, System Monitoring, Clipboard History and Disk Clean.

**Functionality**
- [Cronomix](https://github.com/zagortenay333/cronomix) (MIT) — stopwatch logic (`lib/stopwatch.js`): RUNNING/PAUSED/RESET state machine and time formatting.
- [window-centering](https://github.com/niam0t/window-centering) (GPL-2.0) — base for the window centering module (`lib/windowCentering.js`), the shortcut manager (`lib/keybindingManager.js`), and the initial structure of the GSettings schema and preferences UI.

**Usability**
- [GNOME Shell Extension Reference](https://github.com/julio641742/gnome-shell-extension-reference) (julio641742) — `PanelMenu.Button` + `PopupMenu` pattern used in the top bar indicator.
- [GJS Guide](https://gjs.guide/extensions/) — ESModule pattern (GNOME 45+), `PopupMenu` API, and overall architecture (Clutter, St, PanelMenu).
