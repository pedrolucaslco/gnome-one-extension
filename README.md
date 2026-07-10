# One Extension

Extensão GNOME all-in-one com múltiplas ferramentas integradas.

Inspirada no [OneMenu](https://coffeebreak.software/one-menu/) para macOS.

## Módulos

| Versão | Módulo | Status |
|--------|--------|--------|
| v0.1.0 | Window Centering | ✅ Implementado |
| — | Clipboard History | 🔜 Planejado |
| — | RAM Monitor | 🔜 Planejado |
| — | Clock/Timer | 🔜 Planejado |
| — | Tiling Manager | 🔜 Planejado |

## Window Centering (v0.1.0)

Centraliza e redimensiona a janela focada com um atalho de teclado.

### Funcionalidades

- Centralizar janela na tela
- Redimensionar para porcentagem da resolução
- Suporte a múltiplos monitores
- Forçar resize em janelas maximizadas (opcional)
- Atalho configurável (padrão: `Alt+Shift+A`)

### Configurações

| Configuração | Padrão | Descrição |
|---|---|---|
| Change Position | ✅ | Centralizar a janela |
| Change Size | ✅ | Redimensionar a janela |
| Allow Forced Resize | ❌ | Permitir resize em janela maximizada |
| Width | 86% | Largura da janela (% da tela) |
| Height | 90% | Altura da janela (% da tela) |

## Instalação

### Dependências

- GNOME Shell 45, 46, 47, 48 ou 50
- `glib-compile-schemas`

### Instalação Local

```bash
# Compilar schemas
glib-compile-schemas schemas/

# Instalar
gnome-extensions install one-extension@pedrolucaslco

# Ativar
gnome-extensions enable one-extension@pedrolucaslco
```

### Desenvolvimento

```bash
# After changes, reinstall
gnome-extensions install one-extension@pedrolucaslco --force

# Reiniciar GNOME Shell (X11)
killall -3 gnome-shell

# Ver logs
journalctl -f -o cat /usr/bin/gnome-shell
```

## Licença

GPL-2.0

## Créditos

- [window-centering](https://github.com/niam0t/window-centering) — código base do módulo Window Centering
- [OneMenu](https://coffeebreak.software/one-menu/) — inspiração do produto
