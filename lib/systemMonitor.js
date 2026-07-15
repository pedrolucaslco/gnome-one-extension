import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { PubSub } from './utils/pubsub.js';
import { readMemInfo } from './memInfo.js';

let GTop, hasGTop = true;
try {
    ({ default: GTop } = await import('gi://GTop'));
} catch {
    hasGTop = false;
}

function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        try {
            const file = Gio.File.new_for_path(path);
            file.load_contents_async(null, (f, res) => {
                try {
                    const [, contents] = f.load_contents_finish(res);
                    resolve(new TextDecoder().decode(contents));
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

export class SystemMonitor extends PubSub {
    constructor(settings) {
        super();
        this._settings = settings;
        this._timerId = null;
        this._lastProcessor = { total: 0, user: 0, system: 0 };
        this._lastQuery = 0;

        if (hasGTop) {
            this._fsusage = new GTop.glibtop_fsusage();
        }
    }

    enable() {
        this._lastQuery = Date.now();
        this._update();
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            this._settings.get_int('system-monitor-interval'),
            () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    disable() {
        if (this._timerId) {
            GLib.Source.remove(this._timerId);
            this._timerId = null;
        }
        this.destroy();
    }

    async _update() {
        this._lastQuery = Date.now();

        const cpu = await this._readCpu();
        const ram = this._readRam();
        const disk = this._readDisk();

        this.publish('updated', { cpu, ram, disk });
    }

    async _readCpu() {
        try {
            const content = await readFileAsync('/proc/stat');
            const line = content.split('\n')[0];
            const parts = line.split(/\s+/).slice(1).map(Number);

            const user = parts[0] + parts[1];
            const system = parts[2];
            const total = parts.reduce((a, b) => a + b, 0);

            const prev = this._lastProcessor;
            const totalDelta = total - (prev.total ?? total);

            if (totalDelta > 0 && prev.total > 0) {
                const active = (user + system) - (prev.user + prev.system);
                const usage = Math.max(0, Math.min(100, (active / totalDelta) * 100));

                this._lastProcessor = { total, user, system };
                return {
                    percent: Math.round(usage * 10) / 10,
                    label: `${Math.round(usage)}%`,
                };
            }

            this._lastProcessor = { total, user, system };
            return { percent: 0, label: '0%' };
        } catch {
            return { percent: 0, label: 'N/A' };
        }
    }

    _readRam() {
        try {
            const { percent, usedKB } = readMemInfo();
            return {
                percent: Math.round(percent * 10) / 10,
                label: `${Math.round(percent)}%`,
                used: this._formatBytes(usedKB * 1024),
            };
        } catch {
            return { percent: 0, label: 'N/A', used: '' };
        }
    }

    _readDisk() {
        try {
            if (hasGTop) {
                GTop.glibtop_get_fsusage(this._fsusage, '/');
                const total = this._fsusage.blocks * this._fsusage.block_size;
                const free = this._fsusage.bavail * this._fsusage.block_size;
                const used = total - free;
                const percent = total > 0 ? (used / total) * 100 : 0;

                return {
                    percent: Math.round(percent * 10) / 10,
                    label: `${Math.round(percent)}%`,
                    used: this._formatBytes(used),
                };
            }

            // fallback: Gio.File
            const file = Gio.File.new_for_path('/');
            const info = file.query_filesystem_info(
                'filesystem::size,filesystem::free',
                null
            );

            const total = info.get_attribute_uint64('filesystem::size');
            const free = info.get_attribute_uint64('filesystem::free');
            const used = total - free;
            const percent = total > 0 ? (used / total) * 100 : 0;

            return {
                percent: Math.round(percent * 10) / 10,
                label: `${Math.round(percent)}%`,
                used: this._formatBytes(used),
            };
        } catch {
            return { percent: 0, label: 'N/A', used: '' };
        }
    }

    _formatBytes(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
        if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)}MB`;
        return `${(bytes / 1073741824).toFixed(1)}GB`;
    }
}
