import GLib from 'gi://GLib';

export function readMemInfo() {
    try {
        const content = GLib.file_get_contents('/proc/meminfo')[1];
        const text = new TextDecoder().decode(content);

        const getValue = (key) => {
            const match = text.match(new RegExp(`${key}:\\s+(\\d+)`));
            return match ? parseInt(match[1]) : 0;
        };

        const totalKB = getValue('MemTotal');
        const availableKB = getValue('MemAvailable');
        const usedKB = totalKB - availableKB;
        const percent = totalKB > 0 ? (usedKB / totalKB) * 100 : 0;

        return { totalKB, usedKB, availableKB, percent };
    } catch {
        return { totalKB: 0, usedKB: 0, availableKB: 0, percent: 0 };
    }
}
