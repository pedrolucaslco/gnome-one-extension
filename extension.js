import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { WindowCentering } from './lib/windowCentering.js';
import { KeybindingManager } from './lib/keybindingManager.js';
import { Indicator } from './lib/indicator.js';
import { RoundedCorners } from './lib/roundedCorners.js';
import { Stopwatch } from './lib/stopwatch.js';

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

        this._roundedCorners = new RoundedCorners(this._settings);
        this._roundedCorners.enable();

        if (this._settings.get_boolean('stopwatch-enabled')) {
            this._startStopwatch();
        }

        this._settings.connect('changed::stopwatch-enabled', () => {
            if (this._settings.get_boolean('stopwatch-enabled')) {
                this._startStopwatch();
            } else {
                this._stopStopwatch();
            }
        });

        this._indicator.setupSettings();
    }

    disable() {
        this._stopStopwatch();

        this._roundedCorners?.disable();
        this._roundedCorners = null;

        this._indicator?.destroy();
        this._indicator = null;

        this._keybindingManager.removeAllKeybindings();
        this._keybindingManager = null;
        this._windowCentering = null;
        this._settings = null;
    }

    _startStopwatch() {
        if (this._stopwatch) return;
        this._stopwatch = new Stopwatch();
        this._stopwatch.enable();
        this._indicator.setupStopwatch(this._stopwatch);
    }

    _stopStopwatch() {
        if (!this._stopwatch) return;
        this._stopwatch.disable();
        this._stopwatch = null;
    }
}
