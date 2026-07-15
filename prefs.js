import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OneExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const generalPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'emblem-system-symbolic',
        });
        window.add(generalPage);

        const mainGroup = new Adw.PreferencesGroup({ title: _('Window centering') });
        generalPage.add(mainGroup);

        this._addSwitchRow(mainGroup, settings, {
            title: _('Change position'),
            description: _('When using the shortcut, the window will be centered on the screen.'),
            settingKey: 'change-position',
        });

        this._addSwitchRow(mainGroup, settings, {
            title: _('Change size'),
            description: _('When using the shortcut, the size of the window will be adjusted.'),
            settingKey: 'change-size',
        });

        this._addSwitchRow(mainGroup, settings, {
            title: _('Allow forced resize'),
            description: _('Allows forced resizing even if the window is maximized.'),
            settingKey: 'allow-forced-resize',
        });

        this._addSpinRow(mainGroup, settings, {
            title: _('Percentage width'),
            description: _('Portion of the screen width the window will occupy.'),
            settingKey: 'frame-width',
            lower: 1,
            upper: 100,
        });

        this._addSpinRow(mainGroup, settings, {
            title: _('Percentage height'),
            description: _('Portion of the screen height the window will occupy.'),
            settingKey: 'frame-height',
            lower: 1,
            upper: 100,
        });

        this._addKeybindingEntry(mainGroup, settings, {
            title: _('Shortcut'),
            description: _('Key combination to center and resize the window.'),
            settingKey: 'centering-keybinding',
        });

        const swPage = new Adw.PreferencesPage({
            title: _('Stopwatch'),
            icon_name: 'alarm-symbolic',
        });
        window.add(swPage);

        const swGroup = new Adw.PreferencesGroup({ title: _('Stopwatch') });
        swPage.add(swGroup);

        this._addSwitchRow(swGroup, settings, {
            title: _('Enable stopwatch'),
            description: _('Show the stopwatch in the panel menu.'),
            settingKey: 'stopwatch-enabled',
        });

        const smPage = new Adw.PreferencesPage({
            title: _('System Monitor'),
            icon_name: 'utilities-system-monitor-symbolic',
        });
        window.add(smPage);

        const smGroup = new Adw.PreferencesGroup({ title: _('System monitor') });
        smPage.add(smGroup);

        this._addSwitchRow(smGroup, settings, {
            title: _('Enable system monitor'),
            description: _('Show CPU, RAM and Disk indicators in the panel menu.'),
            settingKey: 'system-monitor-enabled',
        });

        this._addSwitchRow(smGroup, settings, {
            title: _('Show RAM in top panel'),
            description: _('Display RAM usage as a separate indicator in the top bar.'),
            settingKey: 'ram-indicator-enabled',
        });

        this._addSwitchRow(smGroup, settings, {
            title: _('Notify on high RAM usage'),
            description: _('Send a notification when RAM usage exceeds the threshold.'),
            settingKey: 'ram-indicator-notify',
        });

        this._addSpinRow(smGroup, settings, {
            title: _('RAM warning threshold'),
            description: _('RAM usage percentage that triggers a notification.'),
            settingKey: 'ram-indicator-threshold',
            lower: 1,
            upper: 100,
        });

        this._addSpinRow(smGroup, settings, {
            title: _('Update interval'),
            description: _('How often to refresh system data, in seconds.'),
            settingKey: 'system-monitor-interval',
            lower: 1,
            upper: 30,
        });
    }

    _addSwitchRow(group, settings, { title, description, settingKey }) {
        const row = new Adw.SwitchRow({ title, subtitle: description });
        settings.bind(settingKey, row, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(row);
    }

    _addSpinRow(group, settings, { title, description, settingKey, lower, upper }) {
        const row = Adw.SpinRow.new_with_range(lower, upper, 1);
        row.set_title(title);
        row.set_subtitle(description);
        settings.bind(settingKey, row, 'value', Gio.SettingsBindFlags.DEFAULT);
        group.add(row);
    }

    _addKeybindingEntry(group, settings, { title, description, settingKey }) {
        const row = new Adw.ActionRow({ title, subtitle: description });
        const storedKeybinding = settings.get_strv(settingKey)[0] || '';
        const displayKeybinding = this._formatToDisplayFormat(storedKeybinding);

        const keybindingEntry = new Gtk.Entry({
            text: displayKeybinding,
            valign: Gtk.Align.CENTER,
        });

        keybindingEntry.connect('changed', (entry) => {
            const text = entry.get_text();
            if (this._isValidKeybinding(text)) {
                row.remove_css_class('error');
                row.set_tooltip_text('');
                const formattedKeys = this._formatToStoredFormat(text);
                settings.set_strv(settingKey, [formattedKeys]);
            } else {
                row.add_css_class('error');
                row.set_tooltip_text(_('Use format: Ctrl+Alt+Key'));
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
