import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { WindowCentering } from './lib/windowCentering.js';
import { KeybindingManager } from './lib/keybindingManager.js';
import { Indicator } from './lib/indicator.js';
import { Stopwatch } from './lib/stopwatch.js';
import { SystemMonitor } from './lib/systemMonitor.js';

export default class OneExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._signalIds = [];

        this._indicator = new Indicator(this);
        Main.panel.addToStatusArea(
            this.uuid, this._indicator, this._settings.get_int('indicator-position'), 'right'
        );

        this._signalIds.push(
            this._settings.connect('changed::indicator-position', () => {
                Main.panel._rightBox?.set_child_at_index(
                    this._indicator.container ?? this._indicator,
                    this._settings.get_int('indicator-position')
                );
            })
        );

        this._windowCentering = new WindowCentering(this._settings);
        this._keybindingManager = new KeybindingManager(this._settings);

        this._keybindingManager.addKeybinding(
            'centering-keybinding',
            this._windowCentering.adjustFrame.bind(this._windowCentering)
        );

        if (this._settings.get_boolean('system-monitor-enabled')) {
            this._startSystemMonitor();
        }

        this._signalIds.push(
            this._settings.connect('changed::system-monitor-enabled', () => {
                if (this._settings.get_boolean('system-monitor-enabled')) {
                    this._startSystemMonitor();
                } else {
                    this._stopSystemMonitor();
                }
            })
        );

        if (this._settings.get_boolean('stopwatch-enabled')) {
            this._startStopwatch();
        }

        this._signalIds.push(
            this._settings.connect('changed::stopwatch-enabled', () => {
                if (this._settings.get_boolean('stopwatch-enabled')) {
                    this._startStopwatch();
                } else {
                    this._stopStopwatch();
                }
            })
        );
    }

    disable() {
        this._stopStopwatch();
        this._stopSystemMonitor();

        for (const id of this._signalIds)
            this._settings.disconnect(id);
        this._signalIds = [];

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
        this._indicator.setupStopwatch(this._stopwatch);
    }

    _stopStopwatch() {
        if (!this._stopwatch) return;
        this._indicator.teardownStopwatch();
        this._stopwatch.disable();
        this._stopwatch.destroy();
        this._stopwatch = null;
    }

    _startSystemMonitor() {
        if (this._systemMonitor) return;
        this._systemMonitor = new SystemMonitor(this._settings);
        this._systemMonitor.enable();
        this._indicator.setupSystemMonitor(this._systemMonitor);
    }

    _stopSystemMonitor() {
        if (!this._systemMonitor) return;
        this._indicator.teardownSystemMonitor();
        this._systemMonitor.disable();
        this._systemMonitor = null;
    }
}
