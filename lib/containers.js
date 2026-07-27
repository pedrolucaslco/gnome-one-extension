import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const RUNTIMES = ['podman', 'docker'];

const TERMINALS = [
    { bin: 'ptyxis', argv: cmd => ['ptyxis', '--new-window', '--', ...cmd] },
    { bin: 'gnome-terminal', argv: cmd => ['gnome-terminal', '--', ...cmd] },
    { bin: 'konsole', argv: cmd => ['konsole', '-e', ...cmd] },
    { bin: 'xterm', argv: cmd => ['xterm', '-e', ...cmd] },
];

function _findAvailableRuntimes() {
    return RUNTIMES.filter(bin => GLib.find_program_in_path(bin) !== null);
}

function _findTerminal() {
    return TERMINALS.find(t => GLib.find_program_in_path(t.bin) !== null) ?? null;
}

export function hasTerminal() {
    return _findTerminal() !== null;
}

function _runAsync(argv) {
    return new Promise(resolve => {
        try {
            const proc = Gio.Subprocess.new(
                argv,
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            proc.communicate_utf8_async(null, null, (source, res) => {
                try {
                    const [, stdout] = source.communicate_utf8_finish(res);
                    resolve({ ok: source.get_successful(), stdout: stdout ?? '' });
                } catch {
                    resolve({ ok: false, stdout: '' });
                }
            });
        } catch {
            resolve({ ok: false, stdout: '' });
        }
    });
}

function _normalize(runtime, c) {
    const id = c.Id || c.ID || c.id;
    if (!id)
        return null;

    let name = '';
    if (Array.isArray(c.Names))
        name = c.Names[0] ?? '';
    else if (typeof c.Names === 'string')
        name = c.Names.split(',')[0];

    const state = (c.State || '').toLowerCase();

    return {
        id,
        name: name || id.slice(0, 12),
        image: c.Image || '',
        status: c.Status || c.State || '',
        state,
        running: state === 'running',
        runtime,
    };
}

function _parseContainers(runtime, stdout) {
    const text = stdout.trim();
    if (!text)
        return [];

    let raw;
    try {
        // podman's `ps --format json` prints a single JSON array.
        const parsed = JSON.parse(text);
        raw = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        // docker's `ps --format json` prints one JSON object per line (NDJSON).
        raw = text.split('\n').map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);
    }

    return raw.map(c => _normalize(runtime, c)).filter(Boolean);
}

export async function listContainers() {
    const runtimes = _findAvailableRuntimes();

    const results = await Promise.all(
        runtimes.map(async runtime => {
            const { ok, stdout } = await _runAsync([runtime, 'ps', '-a', '--format', 'json']);
            return ok ? _parseContainers(runtime, stdout) : [];
        })
    );

    return results.flat().sort((a, b) => {
        if (a.running !== b.running)
            return a.running ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

async function _action(runtime, verb, id) {
    const { ok } = await _runAsync([runtime, verb, id]);
    return ok;
}

export const startContainer = (runtime, id) => _action(runtime, 'start', id);
export const stopContainer = (runtime, id) => _action(runtime, 'stop', id);
export const restartContainer = (runtime, id) => _action(runtime, 'restart', id);

function _spawnInTerminal(cmd) {
    const terminal = _findTerminal();
    if (!terminal)
        return false;

    try {
        Gio.Subprocess.new(terminal.argv(cmd), Gio.SubprocessFlags.NONE);
        return true;
    } catch {
        return false;
    }
}

export function openLogs(runtime, id) {
    return _spawnInTerminal([runtime, 'logs', '-f', '--tail', '200', id]);
}

export function openBash(runtime, id) {
    return _spawnInTerminal([runtime, 'exec', '-it', id, 'bash']);
}
