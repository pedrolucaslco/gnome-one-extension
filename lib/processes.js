import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { readMemInfo } from './memInfo.js';

function _listProcPids() {
    const pids = [];
    try {
        const dir = Gio.File.new_for_path('/proc');
        const enumerator = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);

        let info;
        while ((info = enumerator.next_file(null)) !== null) {
            const name = info.get_name();
            if (/^\d+$/.test(name))
                pids.push(parseInt(name));
        }
    } catch {
        // /proc not readable
    }

    return pids;
}

export function getAllProcesses() {
    const processes = [];

    for (const pid of _listProcPids()) {
        const info = _readProcessInfo(pid);
        if (info && info.rss_kb > 0)
            processes.push(info);
    }

    processes.sort((a, b) => b.rss_kb - a.rss_kb);
    return processes;
}

export function groupByName(processes) {
    const groups = new Map();

    for (const proc of processes) {
        const key = proc.name;
        if (groups.has(key)) {
            const group = groups.get(key);
            group.total_kb += proc.rss_kb;
            group.processes.push(proc);
        } else {
            groups.set(key, {
                name: proc.name,
                total_kb: proc.rss_kb,
                processes: [proc],
            });
        }
    }

    return [...groups.values()].sort((a, b) => b.total_kb - a.total_kb);
}

export function formatMemory(kb) {
    if (kb >= 1048576)
        return `${(kb / 1048576).toFixed(1)} GB`;
    if (kb >= 1024)
        return `${Math.round(kb / 1024)} MB`;
    return `${kb} KB`;
}

export function killProcess(pid, signal = 15) {
    try {
        const subprocess = Gio.Subprocess.new(
            ['kill', `-${signal}`, `${pid}`],
            Gio.SubprocessFlags.NONE
        );
        const success = subprocess.wait_check(null);
        subprocess.destroy();
        return success;
    } catch {
        return false;
    }
}

export function getTotalMemory() {
    return readMemInfo();
}

function _readProcessInfo(pid) {
    try {
        const commPath = `/proc/${pid}/comm`;
        const [success, commContent] = GLib.file_get_contents(commPath);
        if (!success || !commContent)
            return null;

        const name = new TextDecoder().decode(commContent).trim();
        if (!name)
            return null;

        const statusPath = `/proc/${pid}/status`;
        const [ok, statusContent] = GLib.file_get_contents(statusPath);
        if (!ok || !statusContent)
            return null;

        const statusText = new TextDecoder().decode(statusContent);
        const rssMatch = statusText.match(/VmRSS:\s+(\d+)\s+kB/);
        const rss_kb = rssMatch ? parseInt(rssMatch[1]) : 0;

        let cmdline = '';
        const [cmdOk, cmdContent] = GLib.file_get_contents(`/proc/${pid}/cmdline`);
        if (cmdOk && cmdContent) {
            cmdline = new TextDecoder().decode(cmdContent)
                .replace(/\0/g, ' ')
                .trim();
        }

        return { pid, name, rss_kb, cmdline };
    } catch {
        return null;
    }
}
