import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class KeybindingManager {
    constructor(settings) {
        this._settings = settings;
        this._keybindings = new Set();
    }

    addKeybinding(name, callback) {
        if (!this._keybindings.has(name)) {
            Main.wm.addKeybinding(
                name,
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                callback
            );
            this._keybindings.add(name);
        }
    }

    removeKeybinding(name) {
        if (this._keybindings.has(name)) {
            Main.wm.removeKeybinding(name);
            this._keybindings.delete(name);
        }
    }

    removeAllKeybindings() {
        this._keybindings.forEach(name => {
            Main.wm.removeKeybinding(name);
        });
        this._keybindings.clear();
    }
}
