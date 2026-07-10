# Credits & References

## Código Open Source Utilizado

### Rounded Windows (Nathanaelrc/rounded-windows)
- **Licença:** GPL-3.0
- **URL:** https://github.com/Nathanaelrc/rounded-windows
- **Funções adaptadas:**

| Conceito Original | Nosso Arquivo | Descrição |
|---|---|---|
| Squircle GLSL shader | `lib/roundedCornersEffect.js` | Shader de arredondamento |
| Bounds computation | `lib/roundedCorners.js` | Cálculo de bordas |
| Skip libadwaita/libhandy | `lib/roundedCorners.js` | Detecção de app type |

### Window Centering (niam0t/window-centering)
- **Licença:** GPL-2.0
- **URL:** https://github.com/niam0t/window-centering
- **Funções adaptadas:**

| Função Original | Nosso Arquivo | Linha |
|---|---|---|
| `FrameManager.adjustFrame()` | `lib/windowCentering.js` | :20 |
| `FrameManager._getScreenSize()` | `lib/windowCentering.js` | :53 |
| `FrameManager._calcCenterPos()` | `lib/windowCentering.js` | :61 |
| `FrameManager._calcTargetSize()` | `lib/windowCentering.js` | :67 |
| `KeybindingManager` (integralmente) | `lib/keybindingManager.js` | — |
| GSettings schema (6 keys) | `schemas/*.gschema.xml` | — |
| Prefs UI (Adw/Gtk) | `prefs.js` | — |

### GNOME Shell Extension Reference (julio641742)
- **URL:** https://github.com/julio641742/gnome-shell-extension-reference
- **Referências consultadas:**
  - Tutorial POPUPMENU-EXTENSION.md → padrão `PanelMenu.Button` + `PopupMenu`

### GJS Guide (gjs.guide)
- **URL:** https://gjs.guide/extensions/
- **Referências consultadas:**
  - Imports and Modules (ESModule pattern GNOME 45+)
  - PopupMenu API
  - Architecture (Clutter, St, PanelMenu)

## Inspiração do Produto

### OneMenu (Coffeebreak Software)
- **URL:** https://coffeebreak.software/one-menu/
- **Funcionalidades alvo:**
  - Window Manager — ✅ implementado (v1.0.0)
  - Rounded Corners — ✅ implementado (v1.1.0)
  - Clipboard History — 🔜 planejado
  - System Monitoring — 🔜 planejado
  - Disk Clean — 🔜 planejado
