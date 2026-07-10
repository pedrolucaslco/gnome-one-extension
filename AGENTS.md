# One Extension - Guia de Desenvolvimento

## Visão do Produto

Extensão GNOME all-in-one inspirada no [OneMenu](https://coffeebreak.software/one-menu/).
Múltiplas ferramentas integradas em uma única extensão modular.

## Módulos

| Versão | Módulo | Status |
|--------|--------|--------|
| v0.1.0 | Window Centering | ✅ Implementado |
| — | Clipboard History | 🔜 Planejado |
| — | RAM Monitor | 🔜 Planejado |
| — | Clock/Timer | 🔜 Planejado |
| — | Tiling Manager | 🔜 Planejado |

## Convenções de Commit

Sempre em **lowercase**, com prefixo convencional:

- `feat:` — nova funcionalidade ou módulo
- `fix:` — correção de bug
- `chore:` — manutenção, docs, refatoração
- `refactor:` — refatoração de código sem mudar comportamento
- `style:` — formatação, espacos, etc.

Exemplos:
```
feat: add clipboard history module
fix: window centering on multi-monitor setup
chore: update README with install instructions
```

## Versionamento

Semântico: `MAJOR.MINOR.PATCH`

- **MAJOR** — mudanca incompativel na API/config
- **MINOR** — nova funcionalidade retrocompativel
- **PATCH** — correcao de bug

Tags criadas **on-demand** quando solicitado.
Historico de versoes mantido no README.md.

## Estrutura Modular

```
lib/
├── keybindingManager.js   # Gerenciamento compartilhado de atalhos
├── windowCentering.js     # Modulo: centralizacao de janelas
├── clipboardHistory.js    # (futuro) Modulo: historico de clipboard
├── ramMonitor.js          # (futuro) Modulo: monitor de RAM
└── ...
```

Cada modulo:
- Um arquivo em `lib/nomeModulo.js`
- Uma classe com `constructor(settings)` e metodos `enable()`/`disable()`
- `export default` da classe

## Como Adicionar um Novo Modulo

1. Criar `lib/nomeModulo.js` com a classe do modulo
2. Adicionar keys necessarias no `schemas/*.gschema.xml`
3. Compilar schemas: `glib-compile-schemas schemas/`
4. Importar e instanciar em `extension.js` (enable/disable)
5. Adicionar UI de configuracao em `prefs.js`
6. Incrementar `version` no `metadata.json`
7. Documentar no `README.md`
8. Criar commit com `feat: add [nome] module`

## Comandos Uteis

```bash
# Compilar schemas
glib-compile-schemas schemas/

# Instalar localmente
gnome-extensions install one-extension@pedrolucaslco

# Ativar
gnome-extensions enable one-extension@pedrolucaslco

# Desativar
gnome-extensions disable one-extension@pedrolucaslco

# Reiniciar GNOME Shell (X11)
killall -3 gnome-shell

# Reiniciar GNOME Shell (Wayland) - relogar

# Ver logs
journalctl -f -o cat /usr/bin/gnome-shell
```

## Referencias

- [OneMenu](https://coffeebreak.software/one-menu/) — inspiracao do produto
- [window-centering](https://github.com/niam0t/window-centering) — codigo base do modulo Window Centering (GPL-2.0)
- [GNOME Extension Guidelines](https://gjs.guide/extensions/)
- [EGO Review Guidelines](https://gjs.guide/extensions/review-guidelines/)
