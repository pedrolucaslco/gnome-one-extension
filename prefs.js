import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OneExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        window.add(page);

        const mainGroup = new Adw.PreferencesGroup();
        page.add(mainGroup);

        this._addSwitch(mainGroup, settings, {
            title: _("Change Position"),
            description: _("When using the shortcut, the window will be centered on the screen."),
            settingKey: 'change-position'
        });

        this._addSwitch(mainGroup, settings, {
            title: _("Change Size"),
            description: _("When using the shortcut, the size of the window will be adjusted."),
            settingKey: 'change-size'
        });

        this._addSwitch(mainGroup, settings, {
            title: _("Allow Forced Resize"),
            description: _("Allows forced resizing even if the window is maximized."),
            settingKey: 'allow-forced-resize'
        });

        this._addNumericInput(mainGroup, settings, {
            title: _("Percentage Width"),
            description: _("Portion of the screen width the window will occupy."),
            settingKey: 'frame-width',
            range: { lower: 1, upper: 100 }
        });

        this._addNumericInput(mainGroup, settings, {
            title: _("Percentage Height"),
            description: _("Portion of the screen height the window will occupy."),
            settingKey: 'frame-height',
            range: { lower: 1, upper: 100 }
        });

        this._addKeybindingEntry(mainGroup, settings, {
            title: _("Shortcut"),
            description: _("Key combination to center and resize the window."),
            settingKey: 'centering-keybinding'
        });

        const rcGroup = new Adw.PreferencesGroup({ title: _("Rounded Corners") });
        page.add(rcGroup);

        this._addSwitch(rcGroup, settings, {
            title: _("Enable Rounded Corners"),
            description: _("Apply rounded corners to windows."),
            settingKey: 'rounded-corners-enabled'
        });

        this._addNumericInput(rcGroup, settings, {
            title: _("Corner Radius"),
            description: _("Radius of the rounded corners in pixels."),
            settingKey: 'rounded-corners-radius',
            range: { lower: 1, upper: 100 }
        });

        this._addFloatInput(rcGroup, settings, {
            title: _("Smoothing"),
            description: _("Corner shape (0 = circle, 1 = squircle)."),
            settingKey: 'rounded-corners-smoothing',
            range: { lower: 0.0, upper: 1.0 }
        });

        this._addSwitch(rcGroup, settings, {
            title: _("Skip Libadwaita Apps"),
            description: _("Do not apply rounded corners to libadwaita apps."),
            settingKey: 'skip-libadwaita'
        });

        this._addSwitch(rcGroup, settings, {
            title: _("Skip Libhandy Apps"),
            description: _("Do not apply rounded corners to libhandy apps."),
            settingKey: 'skip-libhandy'
        });
    }

    _addSwitch(group, settings, { title, description, settingKey }) {
        const row = new Adw.ActionRow({
            title,
            subtitle: description
        });
        const switchWidget = new Gtk.Switch({
            active: settings.get_boolean(settingKey),
            valign: Gtk.Align.CENTER
        });

        switchWidget.connect('notify::active', (widget) => {
            settings.set_boolean(settingKey, widget.active);
        });

        row.add_suffix(switchWidget);
        row.activatable_widget = switchWidget;
        group.add(row);
    }

    _addNumericInput(group, settings, { title, description, settingKey, range }) {
        const row = new Adw.ActionRow({
            title,
            subtitle: description
        });

        const spinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: range.lower,
                upper: range.upper,
                step_increment: 1,
                value: settings.get_int(settingKey)
            }),
            numeric: true,
            valign: Gtk.Align.CENTER,
            width_chars: 4
        });

        spinButton.connect('value-changed', (widget) => {
            settings.set_int(settingKey, widget.get_value());
        });

        row.add_suffix(spinButton);
        group.add(row);
    }

    _addFloatInput(group, settings, { title, description, settingKey, range }) {
        const row = new Adw.ActionRow({
            title,
            subtitle: description
        });

        const spinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: range.lower,
                upper: range.upper,
                step_increment: 0.1,
                page_increment: 0.1,
                value: settings.get_double(settingKey)
            }),
            digits: 1,
            numeric: true,
            valign: Gtk.Align.CENTER,
            width_chars: 4
        });

        spinButton.connect('value-changed', (widget) => {
            settings.set_double(settingKey, widget.get_value());
        });

        row.add_suffix(spinButton);
        group.add(row);
    }

    _addKeybindingEntry(group, settings, { title, description, settingKey }) {
        const row = new Adw.ActionRow({
            title,
            subtitle: description
        });
        const storedKeybinding = settings.get_strv(settingKey)[0] || '';
        const displayKeybinding = this._formatToDisplayFormat(storedKeybinding);

        const keybindingEntry = new Gtk.Entry({
            text: displayKeybinding,
            valign: Gtk.Align.CENTER,
        });

        keybindingEntry.connect('changed', (entry) => {
            const text = entry.get_text();
            if (this._isValidKeybinding(text)) {
                const formattedKeys = this._formatToStoredFormat(text);
                settings.set_strv(settingKey, [formattedKeys]);
            }
        });

        row.add_suffix(keybindingEntry);
        group.add(row);
    }

    _formatToStoredFormat(text) {
        return text.split('+')
            .map(key => key.trim())
            .map(key => key.length === 1 ? key : `<${key}>`)
            .join('');
    }

    _formatToDisplayFormat(text) {
        return text.replace(/<([^>]+)>/g, '$1').replace(/([A-Za-z])([A-Z])/g, '$1+$2');
    }

    _isValidKeybinding(text) {
        const keys = text.split('+').map(key => key.trim());
        const modifierKeys = keys.slice(0, -1);
        const lastKey = keys[keys.length - 1];
        return modifierKeys.length === 2 && /^[A-Za-z]$/.test(lastKey);
    }
}
