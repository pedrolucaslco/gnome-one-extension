import Shell from 'gi://Shell';

export function getWindowsByApp() {
    const tracker = Shell.WindowTracker.get_default();
    const windows = global.display.get_tab_list(0, null);
    const result = new Map();

    for (const win of windows) {
        const app = tracker.get_window_app(win);
        if (!app) continue;

      const appName = app.get_name().toLowerCase();

      const title = win.get_title();
      if (!title || !title.trim())
          continue;

      if (!result.has(appName))
          result.set(appName, new Set());

      result.get(appName).add(title);
    }

    return new Map(
        [...result.entries()].map(([app, titles]) => [app, [...titles]])
    );
}

export function getWindowsByPid() {
    const tracker = Shell.WindowTracker.get_default();
    const windows = global.display.get_tab_list(0, null);
    const result = new Map();

    for (const win of windows) {
        const app = tracker.get_window_app(win);
        if (!app) continue;

        const pid = win.get_pid();
        if (pid <= 0) continue;

        const title = win.get_title();
        if (!title || !title.trim()) continue;

        if (!result.has(pid))
            result.set(pid, []);

        result.get(pid).push(title);
    }

    return result;
}
