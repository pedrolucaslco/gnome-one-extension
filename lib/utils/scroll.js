import St from 'gi://St';
import Clutter from 'gi://Clutter';

export class ScrollBox {
    constructor() {
        this.actor = new St.ScrollView({
            style_class: 'one-extension-scroll',
            x_expand: true,
            overlay_scrollbars: true,
        });

        this.box = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'one-extension-scroll-box',
        });

        this.actor.set_child(this.box);
    }

    destroy() {
        this.actor.destroy();
    }
}
