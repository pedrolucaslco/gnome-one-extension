<p align="center">
  <img src="icon.svg" width="120" alt="One Extension Icon"/>
</p>

<h1 align="center">One Extension</h1>

<p align="center">
  Extensão GNOME all-in-one com múltiplas ferramentas integradas em uma única extensão modular.
</p>

<p align="center">
  <a href="https://github.com/pedrolucaslco/gnome-one-extension/releases"><img src="https://img.shields.io/badge/version-1.7.1-blue?style=flat-square" alt="Version"/></a>
  <a href="https://github.com/pedrolucaslco/gnome-one-extension/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0-green?style=flat-square" alt="License"/></a>
  <a href="https://extensions.gnome.org/"><img src="https://img.shields.io/badge/GNOME%20Shell-45%20|%2046%20|%2047%20|%2048%20|%2050-purple?style=flat-square" alt="GNOME Shell"/></a>
</p>

---

## Funcionalidades

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Window Centering** | Centraliza e redimensiona janelas com atalho | ✅ `v1.0.0` |
| **Stopwatch** | Cronômetro com interface no painel | ✅ `v1.2.0` |
| **System Monitor** | Indicadores de CPU, RAM e Disco | ✅ `v1.3.0` |
| **RAM Indicator** | Indicador de RAM na top bar com lista de processos | ✅ `v1.7.0` |
| Clipboard History | Histórico de clipboard | 🔜 Planejado |
| Tiling Manager | Gerenciador de janelas | 🔜 Planejado |

## Window Centering

Centraliza e redimensiona a janela focada com um único atalho de teclado.

**Atalho padrão:** `Alt+Shift+A`

- Centralizar janela na tela
- Redimensionar para porcentagem da resolução
- Suporte a múltiplos monitores
- Forçar resize em janelas maximizadas (opcional)
- Atalho totalmente configurável

### Configurações

| Configuração | Padrão | Descrição |
|---|---|---|
| Change Position | ✅ | Centralizar a janela na tela |
| Change Size | ✅ | Redimensionar a janela |
| Allow Forced Resize | ❌ | Permitir resize em janela maximizada |
| Width | 86% | Largura da janela (% da tela) |
| Height | 90% | Altura da janela (% da tela) |

## Instalação

### Dependências

- GNOME Shell 45, 46, 47, 48 ou 50
- `glib-compile-schemas`

### Via repositório (recomendado)

```bash
git clone https://github.com/pedrolucaslco/gnome-one-extension.git
cd gnome-one-extension
./build.sh
```

### Manual

```bash
glib-compile-schemas schemas/
gnome-extensions install one-extension@pedrolucaslco
gnome-extensions enable one-extension@pedrolucaslco
```

## Desenvolvimento

```bash
# Instalar/atualizar extensão
./build.sh

# Reiniciar GNOME Shell (fecha apps abertos)
./build.sh --restart

# Ver logs em tempo real
journalctl -f -o cat /usr/bin/gnome-shell
```

### Estrutura do Projeto

```
gnome-one-extension/
├── extension.js            # Entry point
├── prefs.js                # UI de preferências (Adw/Gtk)
├── metadata.json           # Metadados da extensão
├── stylesheet.css          # Estilos CSS
├── build.sh                # Script de instalação
├── dev.sh                  # Script de desenvolvimento (nested)
├── schemas/
│   └── *.gschema.xml       # Configurações GSettings
└── lib/
    ├── indicator.js         # Ícone na top bar + menu
    ├── keybindingManager.js # Gerenciamento de atalhos
    ├── windowCentering.js   # Módulo: centralização
    ├── stopwatch.js         # Módulo: cronômetro
    ├── systemMonitor.js     # Módulo: monitor de sistema (CPU/RAM/Disk)
    ├── ramIndicator.js      # Módulo: indicador de RAM na top bar
    ├── processes.js         # Leitura de processos /proc
    ├── memInfo.js           # Utilitário compartilhado: leitura de /proc/meminfo
    ├── windowTracker.js     # Mapeamento de janelas por PID
    ├── icons/               # Ícones SVG customizados
    ├── utils/
    │   ├── button.js        # Componente Button/ButtonBox
    │   ├── circularIndicator.js # Widget de indicador circular
    │   └── pubsub.js        # Sistema de eventos PubSub
    └── views/
        ├── stopwatchView.js    # View do cronômetro
        └── processListView.js  # Lista de processos
```

## Roadmap

- [x] Window Centering (v1.0.0)
- [x] Stopwatch (v1.2.0)
- [x] System Monitor (v1.3.0)
- [x] RAM Indicator (v1.7.0)
- [ ] Clipboard History
- [ ] Tiling Manager

## Changelog

Consulte [CHANGELOG.md](CHANGELOG.md) para o histórico de versões.

## Licença

Este projeto está licenciado sob a licença GPL-2.0 — consulte o arquivo [LICENSE](LICENSE) para detalhes.

## Créditos

Desenvolvido por [pedrolucaslco](https://github.com/pedrolucaslco)

Inspirado no [OneMenu](https://coffeebreak.software/one-menu/) para macOS.
Código base: [window-centering](https://github.com/niam0t/window-centering) (GPL-2.0).

Consulte [CREDITS.md](CREDITS.md) para detalhes completos das referências open source utilizadas.
