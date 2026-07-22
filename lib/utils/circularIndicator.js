import St from 'gi://St';
import GObject from 'gi://GObject';

export const CircularIndicator = GObject.registerClass(
class CircularIndicator extends St.DrawingArea {
    _init(params = {}) {
        super._init({
            style_class: params.style_class ?? 'circular-indicator',
            width: params.width,
            height: params.height,
        });

        this._angle = 0;
        this._lineWidth = 4;
    }

    set_line_width(width) {
        this._lineWidth = width;
        this.queue_repaint();
    }

    set_angle(angle) {
        if (this._angle === angle)
            return;

        this._angle = angle;
        this.queue_repaint();
    }

    vfunc_repaint() {
        const node = this.get_theme_node();
        const bgColor = node.get_color('-indicator-background-color');
        // `-indicator-color` resolves to `-st-accent-color` in stylesheet.css
        // — the user's chosen GNOME accent color — so the ring always matches
        // the system theme instead of a hardcoded RGB value.
        const fgColor = node.get_color('-indicator-color');
        const [w, h] = this.get_surface_size();
        const r = Math.min(w, h) / 2 - this._lineWidth;
        const cx = w / 2;
        const cy = h / 2;

        const cr = this.get_context();
        cr.setLineWidth(this._lineWidth);
        cr.setLineCap(1); // ROUND

        cr.arc(cx, cy, r, 0, 2 * Math.PI);
        cr.setSourceRGBA(
            bgColor.red / 255,
            bgColor.green / 255,
            bgColor.blue / 255,
            bgColor.alpha / 255
        );
        cr.stroke();

        if (this._angle > 0.01) {
            cr.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + this._angle);
            cr.setSourceRGBA(
                fgColor.red / 255,
                fgColor.green / 255,
                fgColor.blue / 255,
                fgColor.alpha / 255
            );
            cr.stroke();
        }

        cr.$dispose();
    }
});
