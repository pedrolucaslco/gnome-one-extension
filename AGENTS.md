# One Extension - Guia de Desenvolvimento

## Visão do Produto

Extensão GNOME all-in-one inspirada no [OneMenu](https://coffeebreak.software/one-menu/).
Múltiplas ferramentas integradas em uma única extensão modular.

## Módulos

| Versão | Módulo | Status |
|--------|--------|--------|
| v1.0.0 | Window Centering | ✅ Implementado |
| v1.2.0 | Stopwatch | ✅ Implementado |
| v1.3.0 | System Monitor | ✅ Implementado |
| v1.7.0 | RAM Indicator | ✅ Implementado |
| — | Clipboard History | 🔜 Planejado |
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

## Fluxo de Commits

Cada commit deve ser gerado dinamicamente pela IA, seguindo estas regras:

### Message (conventional commit)

Formato: `tipo: descrição curta em lowercase`

Exemplos:
- `feat: add clipboard history`
- `fix: window centering on multi-monitor`
- `chore: update build script`

### Description (impacto ao usuário)

2-3 bullets curtos explicando o que mudou para o usuário:

```
- Histórico de clipboard com busca por texto
- Cola itens antigos com um único clique
- Remove necessidade de extensões separadas
```

### Regras

1. Message: sempre `tipo: descrição curta` em lowercase
2. Description: 2-3 bullets curtos, impacto ao usuário
3. Tipos permitidos: `feat`, `fix`, `chore`, `refactor`, `style`
4. Versionamento automático baseado na última tag:

| Tipo | Bump | Exemplo |
|------|------|---------|
| `feat` | minor | v1.0.0 → v1.1.0 |
| `fix` | patch | v1.0.0 → v1.0.1 |
| `chore` | patch | v1.0.0 → v1.0.1 |
| `refactor` | patch | v1.0.0 → v1.0.1 |
| `style` | patch | v1.0.0 → v1.0.1 |
| BREAKING CHANGE | major | v1.0.0 → v2.0.0 |

5. Após o commit, criar tag anotada com a versão

## Versionamento

Semântico: `MAJOR.MINOR.PATCH`

- **MAJOR** — mudanca incompativel na API/config
- **MINOR** — nova funcionalidade retrocompativel
- **PATCH** — correcao de bug

Tags criadas **automaticamente** a cada commit via fluxo de commits.
Historico de versoes mantido no CHANGELOG.md.

## Estrutura Modular

```
lib/
├── keybindingManager.js   # Gerenciamento compartilhado de atalhos
├── windowCentering.js     # Modulo: centralizacao de janelas
├── stopwatch.js           # Modulo: cronometro
├── systemMonitor.js       # Modulo: monitor de sistema (CPU/RAM/Disk)
├── processes.js           # Leitura de processos /proc
├── memInfo.js             # Utilitario: leitura compartilhada de /proc/meminfo
├── windowTracker.js       # Mapeamento de janelas por PID
├── indicator.js           # Painel principal (PanelMenu.Button)
├── icons/                 # Icones SVG customizados
├── utils/
│   ├── button.js          # Componente Button/ButtonBox
│   ├── circularIndicator.js # Widget de indicador circular
│   └── pubsub.js          # Sistema de eventos PubSub
└── views/
    ├── stopwatchView.js   # View do cronometro
    └── processListView.js # Lista de processos
```

Cada modulo:
- Um arquivo em `lib/nomeModulo.js`
- Uma classe com `constructor(settings)` e metodos `enable()`/`disable()`
- `export default` da classe

## Restrições Importantes

### Panel Indicator — NÃO MEXER na estrutura do BoxLayout

`lib/indicator.js` usa um `St.BoxLayout` (`_panelBox`) como filho único do `PanelMenu.Button`, contendo o ícone e o label do stopwatch.

**NUNCA** adicionar filhos diretos ao `PanelMenu.Button` via `this.add_child()`. Sempre adicionar widgets dentro do `_panelBox`.

Motivo: `PanelMenu.Button` estende `St.Button`, que espera um único filho. Múltiplos filhos diretos quebram o layout do painel.

```js
// CORRETO — sempre adicionar ao box
this._panelBox.add_child(novoWidget);

// ERRADO — não fazer isso
this.add_child(novoWidget);
```

**Perguntar ao usuário antes de alterar essa estrutura.**

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
