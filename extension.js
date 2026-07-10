import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { WindowCentering } from './lib/windowCentering.js';
import { KeybindingManager } from './lib/keybindingManager.js';
import { Indicator } from './lib/indicator.js';

export default class OneExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._indicator = new Indicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        this._windowCentering = new WindowCentering(this._settings);
        this._keybindingManager = new KeybindingManager(this._settings);

        this._keybindingManager.addKeybinding(
            'centering-keybinding',
            this._windowCentering.adjustFrame.bind(this._windowCentering)
        );
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;

        this._keybindingManager.removeAllKeybindings();
        this._keybindingManager = null;
        this._windowCentering = null;
        this._settings = null;
    }
}
