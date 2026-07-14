import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import { getTopProcesses, groupByName, formatMemory, killProcess, getTotalMemory } from '../processes.js';
import { getWindowsByApp } from '../windowTracker.js';

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

        const processes = getTopProcesses(30);
        const groups = groupByName(processes);
        const windows = getWindowsByApp();

        if (groups.length === 0) {
            const empty = new St.Label({
                text: 'No processes found',
                style: 'padding: 8px; color: rgba(255,255,255,0.5);',
                x_align: Clutter.ActorAlign.CENTER,
            });
            this._listBox.add_child(empty);
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
            style: 'spacing: 4px; padding: 4px 8px 2px 8px;',
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

        container.add_child(headerRow);

      // const appWindows = windows.get(group.name);
      const appWindows = windows.get(group.name.toLowerCase());
        if (appWindows && appWindows.length > 0) {
            for (const title of appWindows)
                this._addWindowTitle(container, title);
        }

        for (const proc of group.processes)
          this._addProcessRow(container, proc);

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

    _addProcessRow(parent, proc) {
        const row = new St.BoxLayout({
            style: 'spacing: 4px; padding: 1px 8px 1px 16px;',
            x_expand: true,
        });

        const infoLabel = new St.Label({
            text: `PID ${proc.pid} — ${formatMemory(proc.rss_kb)}`,
            style_class: 'ram-process-name',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        if (proc.cmdline) {
            infoLabel.has_tooltip = true;
            infoLabel.tooltip_text = proc.cmdline;
        }
        row.add_child(infoLabel);

        const killBtn = new St.Button({
            style_class: 'ram-process-kill-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            accessible_name: `Kill process ${proc.pid}`,
        });

        const killIcon = new St.Icon({
            icon_name: 'window-close-symbolic',
            style_class: 'ram-process-kill-icon',
        });
        killBtn.add_child(killIcon);

        killBtn.connect('clicked', () => {
            this._onKillClicked(killBtn, proc.pid);
        });

        row.add_child(killBtn);
        parent.add_child(row);
    }

    _onKillClicked(btn, pid) {
        const success = killProcess(pid);
        if (success) {
            this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
                this.refresh();
                this._timeoutId = 0;
                return GLib.SOURCE_REMOVE;
            });
        }
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
        this.actor.destroy();
    }
}
