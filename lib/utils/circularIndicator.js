import St from 'gi://St';
import GObject from 'gi://GObject';

export const CircularIndicator = GObject.registerClass(
class CircularIndicator extends St.DrawingArea {
    _init(params = {}) {
        super._init({
            style_class: 'circular-indicator',
            ...params,
        });

        this._angle = 0;
        this._lineWidth = 3;
        this._colorR = 0.20;
        this._colorG = 0.82;
        this._colorB = 0.48;
    }

    set_angle(angle) {
        if (this._angle === angle)
            return;

        this._angle = angle;
        this.queue_repaint();
    }

    set_color(r, g, b) {
        if (this._colorR === r && this._colorG === g && this._colorB === b)
            return;

        this._colorR = r;
        this._colorG = g;
        this._colorB = b;
        this.queue_repaint();
    }

    vfunc_repaint() {
        const node = this.get_theme_node();
        const bgColor = node.get_color('-indicator-background-color');
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
            cr.setSourceRGBA(this._colorR, this._colorG, this._colorB, 1);
            cr.stroke();
        }

        cr.$dispose();
    }
});
