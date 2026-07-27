# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also `AGENTS.md` for the canonical (Portuguese) contributor guide — commit conventions, versioning rules,
and the module checklist live there and are summarized below.

## What this is

A GNOME Shell extension (`one-extension@pedrolucaslco`) written in vanilla GJS/ESM — no build step, no
bundler, no test framework. Code is copied as-is to `~/.local/share/gnome-shell/extensions/<uuid>/` and run
directly by GNOME Shell's Mutter/JS engine. Targets GNOME Shell 45–50.

## Commands

```bash
# Install/update the extension into the local GNOME Shell extensions dir, compile schemas, re-enable it
./install.sh
./install.sh --clean       # wipe the destination dir first
./install.sh --status      # check install/enabled state
./install.sh --uninstall   # disable + remove

# Launch a nested GNOME Shell (Wayland) with the extension installed, for interactive testing
./dev.sh

# Tail live shell logs while testing (X11/Wayland host session)
journalctl -f -o cat /usr/bin/gnome-shell

# Recompile GSettings schema only, after editing schemas/*.gschema.xml
glib-compile-schemas schemas/

# Cut a GitHub release from the last git tag + matching CHANGELOG.md section (requires gh auth login)
./release.sh
```

There is no lint/test/build command — there are no automated tests in this repo. Validate changes by running
`./dev.sh` and exercising the feature in the nested shell, or `./install.sh` + restarting the real shell
(X11: `killall -3 gnome-shell`; Wayland: log out/in) and watching `journalctl` for exceptions.

## Architecture

**Entry point** (`extension.js`): `OneExtension.enable()` always creates the single top-bar `Indicator` and
the always-on `WindowCentering` + `KeybindingManager`. The other two modules (Stopwatch, SystemMonitor) are
*optional* and independently toggled via GSettings booleans (`stopwatch-enabled`, `system-monitor-enabled`);
`enable()` wires a `settings.connect('changed::<key>-enabled', …)` listener for each so they can be
started/stopped at runtime without reloading the extension. `_start*`/`_stop*` pairs are idempotent (guard on
`this._x` already set/unset) and always tear down through the `Indicator` before destroying the module
itself.

**Module contract**: each `lib/*.js` module is a plain class (not all use GObject) taking `settings` in its
constructor and exposing `enable()`/`disable()`. Modules that need to push live data to the UI use the
lightweight `PubSub` mixin (`lib/utils/pubsub.js`) — `subscribe(event, cb)` / `unsubscribe(id)` /
`publish(event, data)` — rather than GObject signals. Stopwatch publishes `tic`/`state_change`;
SystemMonitor publishes `updated`; the `Indicator` is the sole subscriber and translates events into widget
updates.

**Single panel presence**: there is exactly one top-bar entry, `Indicator` (registered at `this.uuid`),
hosting the stopwatch readout, the system monitor rings, the RAM process list, and the Settings entry all
inside its one popup menu. There used to be a second, separate `RamIndicator` `PanelMenu.Button` — it was
merged into `Indicator` so the extension only ever occupies one top-bar slot; don't reintroduce a second
`Main.panel.addToStatusArea()` call without a strong reason, since a single indicator matches how native
Shell indicators (network, volume, battery) work — one icon, one click target, nested content inside.

**`PanelMenu.Button` single-child constraint** (load-bearing, see `AGENTS.md`): `Indicator` extends
`PanelMenu.Button` → `St.Button`, which accepts exactly one direct child. All panel widgets (icon + stopwatch
label) live inside one `St.BoxLayout` (`this._panelBox`), which is the only thing passed to
`this.add_child()`. Never call `this.add_child()` a second time on the button itself — add to `_panelBox`
instead. The system-monitor rings and the stopwatch view live in fixed, always-present
`PopupMenu.PopupBaseMenuItem` "slots" (`_monitorSlot`, `_stopwatchSlot`) created in `_init` and toggled via
`.visible`, so menu item ordering stays stable regardless of which modules are enabled. The RAM process list
lives in its own slot (`_processSlot`), toggled open by wrapping the RAM ring itself in an `St.Button` and
calling `_toggleProcessList()` on click — clicking the ring is the only way to reveal it, there's no separate
button or icon for it.

**Views vs. modules**: `lib/views/*.js` are display-only widget wrappers (`StopwatchView`,
`ProcessListView`) instantiated by `Indicator`; they hold no state of their own beyond subscribing to the
module's PubSub events and rendering. Business/state logic (timers, `/proc` reads, window matching) stays in
the `lib/*.js` module files, not the views.

**System data sources**: `lib/memInfo.js` centralizes `/proc/meminfo` parsing (shared by `SystemMonitor` and
`ProcessListView` — don't re-parse it ad hoc). `lib/processes.js` reads `/proc/<pid>/*` for the process list.
`lib/windowTracker.js` maps PIDs to Mutter windows so the RAM process list can jump to/highlight the owning
window — process-to-window matching is PID-based, not title-based (see recent fix in git log). The high-RAM
notification threshold check lives in `SystemMonitor` (it already polls RAM every update cycle), not in a
separate poller.

**Preferences** (`prefs.js`): Adw/Gtk4 preferences UI, separate process from the shell extension itself,
reads/writes the same GSettings schema (`schemas/org.gnome.shell.extensions.one-extension.gschema.xml`).
Any new setting needs a schema entry (then `glib-compile-schemas`) before either `extension.js` or `prefs.js`
can read/write it.

## Adding a new module

Follow the checklist in `AGENTS.md` §"Como Adicionar um Novo Modulo": new `lib/<name>.js` class with
`constructor(settings)`/`enable()`/`disable()`, schema keys + recompile, wire into `extension.js`
enable/disable (with a settings-changed toggle listener if it's optional), add prefs UI, bump `version` in
`metadata.json`, document in `README.md`.

## Commit conventions

Conventional commits, lowercase, one of `feat|fix|chore|refactor|style` (see `AGENTS.md` for the full
semver-bump table: feat→minor, fix/chore/refactor/style→patch, BREAKING CHANGE→major). Tags are created
per-commit following this scheme.
