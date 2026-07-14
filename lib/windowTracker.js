import Shell from 'gi://Shell';

export function getWindowsByApp() {
    const tracker = Shell.WindowTracker.get_default();
    const windows = global.display.get_tab_list(0, null);
    const result = new Map();

    for (const win of windows) {
        const app = tracker.get_window_app(win);
        if (!app) continue;

        const appName = app.get_name();
        const title = win.get_title();
        if (!title) continue;

        if (!result.has(appName))
            result.set(appName, []);

        result.get(appName).push(title);
    }

    return result;
}
