import St from 'gi://St';
import GLib from 'gi://GLib';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {
    listContainers, startContainer, stopContainer, restartContainer,
    openLogs, openBash, hasTerminal,
} from '../containers.js';

// Renders straight into a PopupMenu.PopupMenuSection passed in by the
// caller — same standard menu components as everything else in the panel
// (PopupMenuItem, like the "Settings" row), with each container as a
// PopupSubMenuMenuItem: GNOME's built-in accordion menu item (the same one
// used throughout the system menu), expanding via the arrow on its right
// to reveal status and actions instead of a bespoke widget.
//
// Rows are created once per container id and updated in place on every
// refresh, never destroyed and rebuilt while the container still exists —
// doing a full rebuild each poll used to tear down and recreate whichever
// item the user had expanded, which looked like it was randomly collapsing.
// This way a row's expand/collapse state is only ever touched by the user
// clicking it (or another one), or the whole panel closing — both already
// handled natively by PopupSubMenuMenuItem/PopupMenu, nothing custom needed.
export class ContainersView {
    constructor(settings, section) {
        this._settings = settings;
        this._section = section;
        this._refreshing = false;
        this._hasTerminal = hasTerminal();
        this._entries = new Map(); // container id -> { item, statusRow, toggleRow, shellRow, entry-local container }
        this._emptyRow = null;

        this._buildHeader();
        this.refresh();
        this._startAutoRefresh();
    }

    _buildHeader() {
        this._headerLabel = new St.Label({
            text: 'Containers',
            style_class: 'container-header',
        });
        this._section.box.add_child(this._headerLabel);
    }

    _startAutoRefresh() {
        const seconds = this._settings.get_int('containers-refresh-interval');
        this._refreshTimerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            seconds,
            () => {
                this.refresh();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    async refresh() {
        if (this._refreshing)
            return;
        this._refreshing = true;

        try {
            const containers = await listContainers();
            this._render(containers);
        } finally {
            this._refreshing = false;
        }
    }

    _render(containers) {
        if (containers.length === 0) {
            for (const entry of this._entries.values())
                entry.item.destroy();
            this._entries.clear();

            if (!this._emptyRow) {
                this._emptyRow = this._makeInertRow('No containers found');
                this._section.addMenuItem(this._emptyRow);
            }
            return;
        }

        if (this._emptyRow) {
            this._emptyRow.destroy();
            this._emptyRow = null;
        }

        const seenIds = new Set();
        for (const container of containers) {
            seenIds.add(container.id);
            const entry = this._entries.get(container.id);
            if (entry)
                this._updateContainerItem(entry, container);
            else
                this._addContainerItem(container);
        }

        for (const [id, entry] of this._entries) {
            if (!seenIds.has(id)) {
                entry.item.destroy();
                this._entries.delete(id);
            }
        }
    }

    _addContainerItem(container) {
        const entry = { container };

        const item = new PopupMenu.PopupSubMenuMenuItem(container.name, true);
        entry.item = item;

        // PopupSubMenu (the expand area) auto-adds a scrollbar once the
        // whole popup menu's natural height exceeds its available on-screen
        // space — this is the one lever it exposes to opt out of that, so
        // the status/actions list always renders in full instead.
        item.menu._needsScrollbar = () => false;

        entry.statusRow = this._makeInertRow(container.status);
        item.menu.addMenuItem(entry.statusRow);
        item.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        entry.toggleRow = this._makeActionRow({
            onActivate: () => this._runAction(
                entry.container.running ? stopContainer : startContainer, entry.container
            ),
        });
        item.menu.addMenuItem(entry.toggleRow);

        item.menu.addMenuItem(this._makeActionRow({
            label: 'Restart Container',
            icon: 'view-refresh-symbolic',
            onActivate: () => this._runAction(restartContainer, entry.container),
        }));

        item.menu.addMenuItem(this._makeActionRow({
            label: 'View Logs',
            icon: 'text-x-generic-symbolic',
            disabled: !this._hasTerminal,
            onActivate: () => openLogs(entry.container.runtime, entry.container.id),
        }));

        entry.shellRow = this._makeActionRow({
            label: 'Open Shell',
            icon: 'utilities-terminal-symbolic',
            onActivate: () => openBash(entry.container.runtime, entry.container.id),
        });
        item.menu.addMenuItem(entry.shellRow);

        this._section.addMenuItem(item);
        this._entries.set(container.id, entry);

        this._applyContainerState(entry, container);
    }

    _updateContainerItem(entry, container) {
        entry.container = container;
        this._applyContainerState(entry, container);
    }

    _applyContainerState(entry, container) {
        const { item, statusRow, toggleRow, shellRow } = entry;

        item.icon.icon_name = container.running
            ? 'media-record-symbolic'
            : 'media-playback-stop-symbolic';
        item.icon.remove_style_class_name('container-icon-running');
        item.icon.remove_style_class_name('container-icon-stopped');
        item.icon.add_style_class_name(
            container.running ? 'container-icon-running' : 'container-icon-stopped'
        );

        statusRow.label.text = container.status;

        toggleRow.label.text = container.running ? 'Stop Container' : 'Start Container';
        toggleRow.icon_actor.icon_name = container.running
            ? 'media-playback-stop-symbolic' : 'media-playback-start-symbolic';

        shellRow.setSensitive(this._hasTerminal && container.running);
    }

    _makeActionRow({ label, icon, onActivate, disabled = false }) {
        const row = new PopupMenu.PopupMenuItem(label ?? '');
        const rowIcon = new St.Icon({ icon_name: icon ?? '', style_class: 'popup-menu-icon' });
        row.insert_child_below(rowIcon, row.label);
        row.icon_actor = rowIcon;

        row.connect('activate', onActivate);
        row.setSensitive(!disabled);

        return row;
    }

    _makeInertRow(text) {
        return new PopupMenu.PopupMenuItem(text, { reactive: false, can_focus: false, hover: false });
    }

    async _runAction(action, container) {
        await action(container.runtime, container.id);
        this.refresh();
    }

    destroy() {
        if (this._refreshTimerId) {
            GLib.source_remove(this._refreshTimerId);
            this._refreshTimerId = 0;
        }
        this._headerLabel.destroy();
    }
}
