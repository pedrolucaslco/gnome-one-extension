import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import { getAllProcesses, groupByName, formatMemory, killProcess, getTotalMemory } from '../processes.js';
import { getWindowsByPid } from '../windowTracker.js';

export class ProcessListView {
    constructor() {
        this._timeoutId = 0;

        this.actor = new St.BoxLayout({
            vertical: true,
            style: 'spacing: 2px; min-width: 280px;',
        });

        this._buildHeader();
        this._buildProcessList();
        this.refresh();
        this._startAutoRefresh();
    }

    _startAutoRefresh() {
        this._refreshTimerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            3,
            () => {
                this.refresh();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _buildHeader() {
        this._headerLabel = new St.Label({
            text: 'Loading...',
            style_class: 'ram-process-header',
        });
        this.actor.add_child(this._headerLabel);
    }

    _buildProcessList() {
        this._listBox = new St.BoxLayout({
            vertical: true,
            style: 'spacing: 2px;',
            y_expand: true,
        });

        this._scrollView = new St.ScrollView({
            overlay_scrollbars: true,
            style: 'max-height: 400px;',
        });
        this._scrollView.set_child(this._listBox);
        this.actor.add_child(this._scrollView);
    }

    refresh() {
        const adjustment = this._scrollView.vadjustment;
        const scrollValue = adjustment.value;

        this._listBox.destroy_all_children();

        const mem = getTotalMemory();
        this._headerLabel.set_text(
            `RAM: ${Math.round(mem.percent)}% — ${formatMemory(mem.usedKB)} / ${formatMemory(mem.totalKB)}`
        );

        const processes = getAllProcesses();
        const groups = groupByName(processes);
        const windows = getWindowsByPid();

        if (groups.length === 0) {
            const empty = new St.Label({
                text: 'No processes found',
                style: 'padding: 8px; color: rgba(255,255,255,0.5);',
                x_align: Clutter.ActorAlign.CENTER,
            });
            this._listBox.add_child(empty);
            adjustment.value = scrollValue;
            return;
        }

        for (let i = 0; i < groups.length; i++) {
            this._addAppGroup(groups[i], windows);

            if (i < groups.length - 1)
                this._addSeparator();
        }

        adjustment.value = scrollValue;
    }

    _addAppGroup(group, windows) {
        const container = new St.BoxLayout({
            vertical: true,
            style: 'spacing: 1px;',
        });

        const headerRow = new St.BoxLayout({
            style: 'spacing: 4px; padding: 4px 8px; align-items: center;',
            x_expand: true,
        });

        const nameLabel = new St.Label({
            text: group.name,
            style_class: 'ram-process-app-header',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        headerRow.add_child(nameLabel);

        const totalLabel = new St.Label({
            text: formatMemory(group.total_kb),
            style_class: 'ram-process-app-total',
            y_align: Clutter.ActorAlign.CENTER,
        });
        headerRow.add_child(totalLabel);

        const pids = group.processes.map(proc => proc.pid);
        const killBtn = new St.Button({
            style_class: 'icon-button ram-process-kill-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            y_align: Clutter.ActorAlign.CENTER,
            accessible_name: `Quit ${group.name} (${pids.length} process${pids.length > 1 ? 'es' : ''})`,
        });
        killBtn.add_child(new St.Icon({ icon_name: 'window-close-symbolic' }));
        killBtn.connect('clicked', () => {
            this._onKillClicked(killBtn, container, group.name, pids);
        });
        headerRow.add_child(killBtn);

        container.add_child(headerRow);

        const appWindows = [];
        for (const proc of group.processes) {
            const titles = windows.get(proc.pid);
            if (titles) {
                for (const title of titles) {
                    if (!appWindows.includes(title))
                        appWindows.push(title);
                }
            }
        }
        for (const title of appWindows)
            this._addWindowTitle(container, title);

        this._listBox.add_child(container);
    }

    _addWindowTitle(parent, title) {
        const row = new St.BoxLayout({
            style: 'spacing: 4px; padding: 1px 8px 1px 16px;',
            x_expand: true,
        });

        const icon = new St.Icon({
            icon_name: 'view-paged-symbolic',
            style_class: 'ram-process-window-icon',
        });
        row.add_child(icon);

        const label = new St.Label({
            text: title,
            style_class: 'ram-process-window-title',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        row.add_child(label);

        parent.add_child(row);
    }

    _onKillClicked(btn, container, name, pids) {
        if (!btn._confirming) {
            btn._confirming = true;

            btn.remove_all_children();
            btn.add_child(new St.Label({
                text: 'Confirm?',
                y_align: Clutter.ActorAlign.CENTER,
            }));

            btn._confirmTimeout = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                3000,
                () => {
                    btn._confirming = false;
                    btn.remove_all_children();
                    btn.add_child(new St.Icon({ icon_name: 'window-close-symbolic' }));
                    btn._confirmTimeout = 0;
                    return GLib.SOURCE_REMOVE;
                }
            );

            return;
        }

        if (btn._confirmTimeout) {
            GLib.source_remove(btn._confirmTimeout);
            btn._confirmTimeout = 0;
        }

        btn._confirming = false;

        const allKilled = pids.every(pid => killProcess(pid, 9));
        if (!allKilled) {
            btn.remove_all_children();
            btn.add_child(new St.Icon({ icon_name: 'window-close-symbolic' }));
            return;
        }

        log(`Killed ${name} (${pids.length} process${pids.length > 1 ? 'es' : ''})`);
        container.destroy();

        this._timeoutId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            150,
            () => {
                this.refresh();
                this._timeoutId = 0;
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _addSeparator() {
        const sep = new St.BoxLayout({
            style_class: 'ram-process-separator',
            x_expand: true,
        });
        this._listBox.add_child(sep);
    }

    destroy() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }
        if (this._refreshTimerId) {
            GLib.source_remove(this._refreshTimerId);
            this._refreshTimerId = 0;
        }
        this.actor.destroy();
    }
}
