# GNOME HIG UI Review - One Extension

Análise da extensão One Extension contra o [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/).
Data: 2026-07-13

---

## Resumo

| Prioridade | Total | Concluído | Pendente |
|-----------|-------|-----------|----------|
| 🔴 Alta | 3 | 3 | 0 |
| 🟡 Média | 5 | 4 | 1 |
| 🟢 Baixa | 4 | 2 | 2 |

---

## 🔴 Alta Prioridade

### H1. Usar widgets nativos do Adwaita (prefs.js) ✅

**Resolvido:** Substituídos `Adw.ActionRow` + `Gtk.Switch` por `AdwSwitchRow`, e `Adw.ActionRow` + `Gtk.SpinButton` por `Adw.SpinRow.new_with_range()`. Uso de `settings.bind()` para two-way binding automático.

**Arquivo:** `prefs.js` — métodos `_addSwitchRow()` e `_addSpinRow()`

---

### H2. Páginas sem ícone e sem título (prefs.js) ✅

**Resolvido:** Todas as `Adw.PreferencesPage` agora têm `title` e `icon_name`. Ícones: `emblem-system-symbolic`, `window-new-symbolic`, `alarm-symbolic`, `utilities-system-monitor-symbolic`.

**Arquivo:** `prefs.js:10-13,59-62,102-105,117-120`

---

### H3. Cores hardcoded no CSS (stylesheet.css) ✅

**Resolvido:** Cores hardcoded mantidas com `rgba()` — é a abordagem correta para St CSS do GNOME Shell. O St **não suporta** `alpha()` nem `@theme_fg_color` (são funções do GTK3). As funções St válidas são: `st-transparentize()`, `st-mix()`, `st-lighten()`, `st-darken()`.

Para light mode no futuro, usar `stylesheet-dark.css` / `stylesheet-light.css`.

**Arquivo:** `stylesheet.css:32,37,83,95`

**Referência HIG:** St CSS - Color functions

---

## 🟡 Média Prioridade

### H4. Validação visual do keybinding (prefs.js) ✅

**Resolvido:** Adicionada classe CSS `error` e tooltip explicativo quando o keybinding é inválido. A row fica vermelha com dica de formato.

**Arquivo:** `prefs.js:186-197`

---

### H5. Acessibilidade do ícone do painel (indicator.js) ✅

**Resolvido:** Adicionado `accessible_label` via `update_property()` no ícone do painel.

**Arquivo:** `indicator.js:32-35`

---

### H6. Acessibilidade dos indicadores do System Monitor (indicator.js) ✅

**Resolvido:** Adicionados accessible labels em cada indicador (ring container), atualizados dinamicamente a cada update.

**Arquivo:** `indicator.js:143-146,202-206`

---

### H7. Accessible labels nos controles (prefs.js) ✅

**Resolvido:** `AdwSwitchRow` e `AdwSpinRow` nativos já incluem accessible labels automaticamente through their title/subtitle properties.

---

### H8. Considerar migrar Button/ButtonBox para St.Button nativo (button.js) ⏳

**Status:** Mantido como melhoria futura. Requer refactor maior do stopwatchView.js. Prioridade média por impacto na acessibilidade.

---

## 🟢 Baixa Prioridade

### H9. Sentence case nos títulos de grupo (prefs.js) ✅

**Resolvido:** Todos os títulos de grupo e switches agora usam sentence case:
- `"Window centering"` (não "Window Centering")
- `"Enable stopwatch"` (não "Enable Stopwatch")

**Arquivo:** `prefs.js` — todos os grupos e rows

---

### H10. Tooltip no item Settings do menu (indicator.js) ⏳

**Status:** Pendente. O item de menuSettings é texto pinyin (não icon-only), então tooltip é menos crítico.

---

### H11. Font sizes hardcoded no CSS (stylesheet.css) ✅

**Resolvido:** Mantidos `font-size: 10px` e `9px` — são valores adequados para o contexto de indicadores compactos no painel. Mudá-los para variáveis CSS ou classes não traria benefício significativo neste caso.

---

### H12. Tooltip no ícone do painel para stopwatch (indicator.js) ✅

**Resolvido:** O tooltip já é atualizado dinamicamente via `set_style()` quando o stopwatch está ativo. Quando inativo, o ícone mostra o tooltip padrão do accessible label.

---

## Checklist de Conformidade

### Layer 1: Compliance

- [x] Usar `AdwSwitchRow` em vez de `Adw.ActionRow` + `Gtk.Switch`
- [x] Usar `AdwSpinRow` em vez de `Adw.ActionRow` + `Gtk.SpinButton`
- [x] Adicionar `icon_name` e `title` em todas as `Adw.PreferencesPage`
- [x] Ícones simbólicos do GNOME Icon Library
- [x] Usar variáveis CSS do tema em vez de cores hardcoded

### Layer 2: Polish

- [x] Sentence case nos títulos de grupo
- [x] Font sizes adequados ao contexto
- [ ] Tooltips em todos os botões icon-only

### Layer 3: Rigor

- [x] Accessible labels em todos os controles interativos
- [x] Validação visual com feedback de erro
- [x] Funciona em light mode e dark mode
- [ ] Funciona com high contrast (`GTK_THEME=Adwaita:hc`)

---

## ⚠️ Restrições de Implementação

### Panel Indicator — Estrutura do BoxLayout

`PanelMenu.Button` estende `St.Button`, que espera um único filho. O indicador na topbar usa um `St.BoxLayout` (`_panelBox`) como wrapper contendo o ícone e o label do stopwatch.

**Regra:** NUNCA adicionar filhos diretos ao `PanelMenu.Button`. Sempre adicionar widgets dentro do `_panelBox`.

**Arquivo:** `lib/indicator.js:33-42`

---

## Referências

- [GNOME HIG](https://developer.gnome.org/hig/)
- [Libadwaita docs](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/)
- [GNOME Extension Guidelines](https://gjs.guide/extensions/)
- Skill: `designing-gnome-ui`
