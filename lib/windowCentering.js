import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class WindowCentering {
    constructor(settings) {
        this._settings = settings;
    }

    adjustFrame() {
        const window = global.display.focus_window;
        if (!window) return;

        const { x, y, width, height } = window.get_frame_rect();
        const screen = this._getScreenSize(window);
        const targetSize = this._calcTargetSize(screen);
        const centerPos = this._calcCenterPos(targetSize, screen);

        const forceResize = this._settings.get_boolean('allow-forced-resize');
        if (forceResize && (window.maximized_horizontally || window.maximized_vertically)) {
            window.unmaximize(Meta.MaximizeFlags.BOTH);
        }

        const shouldMove = this._settings.get_boolean('change-position');
        const shouldResize = this._settings.get_boolean('change-size');
        const panelHeight = Main.layoutManager.panelBox.height >> 1;

        if (shouldMove) {
            window.move_resize_frame(
                true,
                centerPos.centerX,
                centerPos.centerY + panelHeight,
                shouldResize ? width : targetSize.width,
                shouldResize ? height : targetSize.height
            );
        }

        if (shouldResize) {
            window.move_resize_frame(
                true,
                shouldMove ? centerPos.centerX : x,
                shouldMove ? centerPos.centerY + panelHeight : y,
                targetSize.width,
                targetSize.height
            );
        }
    }

    _getScreenSize(window) {
        const monitorIndex = window.get_monitor();
        const monitor = Main.layoutManager.monitors[monitorIndex];
        return {
            width: monitor.width,
            height: monitor.height,
            x: monitor.x,
            y: monitor.y
        };
    }

    _calcCenterPos(frame, screen) {
        return {
            centerX: screen.x + ((screen.width - frame.width) >> 1),
            centerY: screen.y + ((screen.height - frame.height) >> 1)
        };
    }

    _calcTargetSize(screen) {
        return {
            width: Math.round(screen.width * (this._settings.get_int('frame-width') * 0.01)),
            height: Math.round(screen.height * (this._settings.get_int('frame-height') * 0.01))
        };
    }
}
