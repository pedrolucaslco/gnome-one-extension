import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { PomodoroLog } from './lib/pomodoroLog.js';

export default class OneExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // 'utilities-system-monitor-symbolic' isn't a real icon in Adwaita's
        // icon theme, so the System Monitor page below used to show a blank
        // spot in the sidebar. Bundle the actual GNOME System Monitor
        // symbolic icon with the extension instead of depending on the
        // gnome-system-monitor package being installed on the user's system.
        Gtk.IconTheme.get_for_display(window.get_display())
            .add_search_path(`${this.path}/lib/icons`);

        const generalPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'emblem-system-symbolic',
        });
        window.add(generalPage);

        const indicatorGroup = new Adw.PreferencesGroup({ title: _('Panel indicator') });
        generalPage.add(indicatorGroup);

        this._addSpinRow(indicatorGroup, settings, {
            title: _('Position'),
            description: _('Where the icon sits among the top bar\'s status area. Lower values are closer to the center of the screen, higher values are closer to the system indicators.'),
            settingKey: 'indicator-position',
            lower: 1,
            upper: 20,
        });

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
            icon_name: 'system-monitor-symbolic',
        });
        window.add(smPage);

        const smGroup = new Adw.PreferencesGroup({ title: _('System monitor') });
        smPage.add(smGroup);

        this._addSwitchRow(smGroup, settings, {
            title: _('Enable system monitor'),
            description: _('Show CPU, RAM and Disk indicators in the panel menu. Click the RAM ring to view running processes.'),
            settingKey: 'system-monitor-enabled',
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

        const pomodoroPage = new Adw.PreferencesPage({
            title: _('Pomodoro'),
            icon_name: 'tomato-symbolic',
        });
        window.add(pomodoroPage);

        const pomodoroGroup = new Adw.PreferencesGroup({ title: _('Pomodoro') });
        pomodoroPage.add(pomodoroGroup);

        this._addSwitchRow(pomodoroGroup, settings, {
            title: _('Enable pomodoro'),
            description: _('Show the pomodoro timer in the panel menu.'),
            settingKey: 'pomodoro-enabled',
        });

        const durationsGroup = new Adw.PreferencesGroup({ title: _('Durations') });
        pomodoroPage.add(durationsGroup);

        this._addSpinRow(durationsGroup, settings, {
            title: _('Focus duration'),
            description: _('Length of a focus session, in minutes.'),
            settingKey: 'pomodoro-focus-minutes',
            lower: 1,
            upper: 180,
        });

        this._addSpinRow(durationsGroup, settings, {
            title: _('Short break duration'),
            description: _('Length of a short break, in minutes.'),
            settingKey: 'pomodoro-short-break-minutes',
            lower: 1,
            upper: 60,
        });

        this._addSpinRow(durationsGroup, settings, {
            title: _('Long break duration'),
            description: _('Length of a long break, in minutes.'),
            settingKey: 'pomodoro-long-break-minutes',
            lower: 1,
            upper: 60,
        });

        this._addSpinRow(durationsGroup, settings, {
            title: _('Cycles before long break'),
            description: _('Number of completed focus sessions before a long break is offered.'),
            settingKey: 'pomodoro-cycles-before-long-break',
            lower: 2,
            upper: 8,
        });

        const notifyGroup = new Adw.PreferencesGroup({ title: _('Notifications') });
        pomodoroPage.add(notifyGroup);

        this._addSwitchRow(notifyGroup, settings, {
            title: _('Notify on phase change'),
            description: _('Show a notification when a focus session or break ends.'),
            settingKey: 'pomodoro-notify-enabled',
        });

        this._addSwitchRow(notifyGroup, settings, {
            title: _('Play sound on phase change'),
            description: _('Play a sound when a focus session or break ends.'),
            settingKey: 'pomodoro-sound-enabled',
        });

        this._addSwitchRow(notifyGroup, settings, {
            title: _('Warn before phase ends'),
            description: _('Also notify a few minutes before a focus session or break ends.'),
            settingKey: 'pomodoro-warn-enabled',
        });

        this._addSpinRow(notifyGroup, settings, {
            title: _('Warning lead time'),
            description: _('How many minutes before a phase ends to fire the warning.'),
            settingKey: 'pomodoro-warn-minutes',
            lower: 1,
            upper: 30,
        });

        this._addPomodoroHistoryPage(window);

        const initialPage = settings.get_string('prefs-open-page');
        if (initialPage === 'pomodoro') {
            window.set_visible_page(pomodoroPage);
            settings.set_string('prefs-open-page', '');
        }
    }

    _addPomodoroHistoryPage(window) {
        const log = new PomodoroLog();

        const page = new Adw.PreferencesPage({
            title: _('History'),
            icon_name: 'document-open-recent-symbolic',
        });
        window.add(page);

        const summaryGroup = new Adw.PreferencesGroup({ title: _('Summary') });
        page.add(summaryGroup);

        const todayRow = new Adw.ActionRow({ title: _('Completed today') });
        const todayValue = new Gtk.Label({ label: '0' });
        todayRow.add_suffix(todayValue);
        summaryGroup.add(todayRow);

        const totalRow = new Adw.ActionRow({ title: _('Completed total') });
        const totalValue = new Gtk.Label({ label: '0' });
        totalRow.add_suffix(totalValue);
        summaryGroup.add(totalRow);

        const listGroup = new Adw.PreferencesGroup({ title: _('Recent sessions') });
        page.add(listGroup);

        const clearButton = new Gtk.Button({
            label: _('Clear History'),
            css_classes: ['destructive-action'],
            valign: Gtk.Align.CENTER,
        });
        listGroup.set_header_suffix(clearButton);

        let rows = [];

        const refresh = () => {
            todayValue.set_label(String(log.getTodayCount()));
            totalValue.set_label(String(log.getTotalCount()));

            for (const row of rows)
                listGroup.remove(row);
            rows = [];

            const entries = log.getAll().slice().reverse().slice(0, 50);

            if (entries.length === 0) {
                const emptyRow = new Adw.ActionRow({ title: _('No sessions recorded yet') });
                listGroup.add(emptyRow);
                rows.push(emptyRow);
                return;
            }

            for (const entry of entries) {
                const minutes = Math.round(entry.durationMs / 60000);
                const row = new Adw.ActionRow({
                    title: new Date(entry.completedAt).toLocaleString(),
                    subtitle: `${minutes} min`,
                });
                listGroup.add(row);
                rows.push(row);
            }
        };

        // Clearing history is permanent and can't be reversed like pausing
        // or skipping a session can, so — unlike the rest of this
        // extension's controls — it gets a confirmation dialog.
        clearButton.connect('clicked', () => {
            const dialog = new Adw.MessageDialog({
                heading: _('Clear History?'),
                body: _('This permanently deletes all recorded pomodoro sessions. This cannot be undone.'),
                transient_for: window,
                modal: true,
            });
            dialog.add_response('cancel', _('Cancel'));
            dialog.add_response('clear', _('Clear History'));
            dialog.set_response_appearance('clear', Adw.ResponseAppearance.DESTRUCTIVE);
            dialog.set_default_response('cancel');
            dialog.set_close_response('cancel');
            dialog.connect('response', (_dlg, response) => {
                if (response === 'clear') {
                    log.clear();
                    refresh();
                }
            });
            dialog.present();
        });

        refresh();
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
