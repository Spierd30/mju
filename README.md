# MJU — JSON Viewer & Analyzer

A fast, dark-themed desktop tool for exploring and understanding JSON. Built for developers who need to quickly inspect API responses, understand data structures, and extract specific values.

![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Three input methods** — paste raw JSON, fetch from a URL (with custom headers), or open a file
- **Interactive tree view** — collapsible nodes, color-coded by type, click any value to inspect it
- **Raw editor** — Monaco editor with syntax highlighting and inline error markers
- **Path Inspector** — click a node to get its dot and bracket notation path with one-click copy
- **Schema Summary** — walks the entire JSON tree and reports key counts, nesting depth, and type info
- **Search** — live search across all keys and values, results link back to the tree
- **Array Stats** — min/max/unique counts for primitive arrays, key consistency for object arrays
- **History** — automatically saves sessions, reload any previous JSON with one click

## Download

Grab the installer for your OS from the [Releases](https://github.com/Spierd30/mju/releases) page:

| OS | File |
|---|---|
| Linux (Debian/Ubuntu) | `.deb` |
| Linux (any distro) | `.AppImage` |
| macOS | `.dmg` |
| Windows | `.exe` |

## Building from source

**Prerequisites:**
- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) 18+
- Tauri CLI: `cargo install tauri-cli`

**Linux system dependencies:**
```bash
sudo apt install -y pkg-config libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev
```

**Run in development:**
```bash
npm install
cargo tauri dev
```

**Build installer:**
```bash
cargo tauri build
```

Output goes to `src-tauri/target/release/bundle/`.

## Tech stack

- [Tauri v2](https://tauri.app/) — Rust backend, native OS integrations
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — raw JSON editing
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Lucide](https://lucide.dev/) — icons

## License

MIT
