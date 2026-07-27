import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

// Kept out of GSettings/dconf on purpose: dconf is meant for a handful of
// small values, not an ever-growing list of session records. A flat JSON
// file survives Shell reloads the same way, and this module has zero St/
// Clutter/Main dependencies so it can be imported unchanged from the prefs
// process (see prefs.js) to render the history page.
const MAX_ENTRIES = 500;

function _logFile() {
    const dir = GLib.build_filenamev([GLib.get_user_data_dir(), 'one-extension']);
    GLib.mkdir_with_parents(dir, 0o700);
    return Gio.File.new_for_path(GLib.build_filenamev([dir, 'pomodoro-log.json']));
}

export class PomodoroLog {
    getAll() {
        const file = _logFile();
        try {
            const [ok, contents] = file.load_contents(null);
            if (!ok) return [];
            const text = new TextDecoder('utf-8').decode(contents);
            const data = JSON.parse(text);
            return Array.isArray(data) ? data : [];
        } catch {
            // Missing or corrupt file: treat as an empty log rather than crash.
            return [];
        }
    }

    record({ completedAt, durationMs }) {
        const entries = this.getAll();
        entries.push({ completedAt, durationMs });

        const trimmed = entries.length > MAX_ENTRIES
            ? entries.slice(entries.length - MAX_ENTRIES)
            : entries;

        this._write(trimmed);
        return trimmed;
    }

    getTodayCount() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const since = startOfDay.getTime();

        return this.getAll().filter(e => e.completedAt >= since).length;
    }

    getTotalCount() {
        return this.getAll().length;
    }

    clear() {
        this._write([]);
    }

    _write(entries) {
        const file = _logFile();
        const bytes = new TextEncoder().encode(JSON.stringify(entries));
        file.replace_contents(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    }
}
