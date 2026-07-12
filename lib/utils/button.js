import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { PubSub } from './pubsub.js';

export class ButtonBox {
    constructor(parent, homogeneous = true) {
        this.actor = new St.BoxLayout({
            style_class: 'one-extension-button-box',
        });
        if (parent)
            parent.add_child(this.actor);
        this.actor.layout_manager.homogeneous = homogeneous;
    }

    add(params = {}) {
        params.parent = this.actor;
        return new Button(params);
    }
}

export class Button extends PubSub {
    constructor({
        parent = null,
        icon = '',
        label = '',
        style_class = '',
        wide = false,
        centered = true,
    } = {}) {
        super();

        this.actor = new St.BoxLayout({
            reactive: true,
            can_focus: true,
            track_hover: true,
            style_class: 'one-extension-button',
        });
        if (parent)
            parent.add_child(this.actor);

        this._centered = centered;
        this.actor.x_expand = wide;
        if (style_class)
            this.actor.add_style_class_name(style_class);
        if (icon)
            this.setIcon(icon);
        if (label)
            this.setLabel(label);

        this.actor.connect('destroy', () => this.destroy());
        this.actor.connect('button-release-event', (_actor, event) => {
            switch (event.get_button()) {
                case Clutter.BUTTON_PRIMARY:
                    this.publish('left_click', null);
                    break;
                case Clutter.BUTTON_MIDDLE:
                    this.publish('middle_click', null);
                    break;
                case Clutter.BUTTON_SECONDARY:
                    this.publish('right_click', null);
                    break;
            }
        });
    }

    setIcon(icon) {
        if (this.icon)
            this.icon.destroy();
        this.icon = new St.Icon({
            icon_name: icon,
            style_class: 'one-extension-button-icon',
        });
        this.actor.add_child(this.icon);
    }

    setLabel(label) {
        if (this.label)
            this.label.destroy();
        this.label = new St.Label({
            text: label,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.label.x_align = this._centered
            ? Clutter.ActorAlign.CENTER
            : Clutter.ActorAlign.START;
        this.actor.add_child(this.label);
    }
}
