import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

const ROUNDED_DECLARATIONS = `
uniform vec4  bounds;
uniform float clipRadius;
uniform float exponent;
uniform vec2  pixelStep;

float squircleBounds(vec2 p, vec2 center, float r, float e) {
    vec2  d    = abs(p - center);
    float dist = pow(pow(d.x, e) + pow(d.y, e), 1.0 / e);
    return clamp(r - dist + 0.5, 0.0, 1.0);
}

float getOpacity(vec2 p, vec4 b, float r, float e) {
    if (p.x < b.x || p.x > b.z || p.y < b.y || p.y > b.w) return 0.0;
    float cl = b.x + r, cr = b.z - r;
    float ct = b.y + r, cb = b.w - r;
    vec2 c;
    if      (p.x < cl) c.x = cl;
    else if (p.x > cr) c.x = cr;
    else               return 1.0;
    if      (p.y < ct) c.y = ct;
    else if (p.y > cb) c.y = cb;
    else               return 1.0;
    return squircleBounds(p, c, r, e);
}
`;

const ROUNDED_CODE = `
    vec2  p = cogl_tex_coord0_in.xy / pixelStep;
    float a = getOpacity(p, bounds, clipRadius, exponent);
    cogl_color_out *= a;
`;

export const RoundedCornersEffect = GObject.registerClass(
    { GTypeName: 'OneExtRoundedCornersEffect' },
    class RoundedCornersEffect extends Shell.GLSLEffect {

        _u = null;

        vfunc_build_pipeline() {
            this.add_glsl_snippet(
                Cogl.SnippetHook.FRAGMENT,
                ROUNDED_DECLARATIONS,
                ROUNDED_CODE,
                false,
            );
        }

        _ensureUniforms() {
            if (this._u) return;
            this._u = {
                bounds:     this.get_uniform_location('bounds'),
                clipRadius: this.get_uniform_location('clipRadius'),
                exponent:   this.get_uniform_location('exponent'),
                pixelStep:  this.get_uniform_location('pixelStep'),
            };
        }

        updateUniforms(scaleFactor, radius, smoothing, windowBounds) {
            this._ensureUniforms();
            if (!this._u) return;

            const outerR = radius * scaleFactor;
            const b = [
                windowBounds.x1,
                windowBounds.y1,
                windowBounds.x2,
                windowBounds.y2,
            ];

            let exponent = smoothing * 10 + 2;
            let r = outerR * 0.5 * exponent;
            const maxR = Math.min(b[2] - b[0], b[3] - b[1]) / 2;
            if (maxR > 0 && r > maxR) {
                exponent *= maxR / r;
                r = maxR;
            }

            const actorW = this.actor.get_width();
            const actorH = this.actor.get_height();
            const ps = [
                actorW > 0 ? 1 / actorW : 1,
                actorH > 0 ? 1 / actorH : 1,
            ];

            const u = this._u;
            this.set_uniform_float(u.bounds,     4, b);
            this.set_uniform_float(u.clipRadius, 1, [r]);
            this.set_uniform_float(u.exponent,   1, [exponent]);
            this.set_uniform_float(u.pixelStep,  2, ps);
            this.queue_repaint();
        }
    },
);
