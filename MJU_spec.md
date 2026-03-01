# MJU — JSON Viewer & Analyzer
## App Specification for Claude Code

---

## Overview

MJU is a desktop developer tool for working with JSON API responses. It solves the common problem of needing to quickly understand the structure of an unfamiliar JSON response in order to parse specific values from it. It provides a clean formatted viewer, a structural analyzer, and several developer utilities in a fast, modern dark-themed GUI.

**Target platform:** Linux-first, cross-platform desktop app  
**Tech stack:** Tauri (Rust backend) + React (TypeScript frontend)  
**Theme:** Dark slate — dark background, muted slate tones, clean modern typography

---

## Versioning Plan

| Version | Scope |
|---------|-------|
| v1.0 | Core viewer, all three input methods, headers, save/load, syntax error highlighting, analyzer panel (path copy, schema summary, search, array stats), history/recents |
| v1.1 | JWT inline decoder, Diff mode |

Build v1.0 fully before starting v1.1 features.

---

## Tech Stack & Key Dependencies

### Rust (Backend)
- `serde_json` — JSON parsing and validation
- `reqwest` — HTTP requests for URL fetch (blocking, with custom headers)
- `tauri-plugin-store` — persistent storage for history/recents
- `tauri-plugin-dialog` — native file open/save dialogs
- `tauri-plugin-clipboard-manager` — clipboard access

### React (Frontend)
- TypeScript
- Tailwind CSS — styling
- `shadcn/ui` — component library (use the dark slate theme)
- `@uiw/react-json-view` — collapsible JSON tree viewer
- `@monaco-editor/react` — raw text editor with JSON syntax highlighting and error markers
- `zustand` — lightweight state management

---

## Application Layout

### Shell
- Fixed top toolbar
- Main content area split into two resizable panels (left and right)
- Left panel: Input + JSON viewer
- Right panel: Analyzer

### Top Toolbar
- App name/logo (left)
- **Format JSON** button
- **Save** button (save current JSON to file)
- **Copy All** button (copy raw JSON to clipboard)
- **Search bar** (searches across all keys/values in the tree — see Analyzer: Search)
- View toggle: Tree View / Raw Editor

### Left Panel — Input & Viewer

**Input Section** (top of left panel)  
Three tabs:
1. **Paste** — multiline textarea for pasting raw JSON
2. **URL Fetch** — URL text input + collapsible key/value list for request headers + Fetch button
3. **Open File** — file browser button (triggers native file dialog via Tauri)

A single **Load** / **Fetch** action processes whichever input method is active and loads the JSON into the viewer below.

**Viewer Section** (below input, fills remaining left panel height)  
Toggled by the toolbar view toggle:
- **Tree View** — collapsible interactive JSON tree using `@uiw/react-json-view`. All nodes collapsible. Clicking any value selects it (highlights it and triggers path display in analyzer panel).
- **Raw Editor** — Monaco editor in JSON mode. Shows syntax highlighting and inline error markers. User can edit the JSON here. Edited JSON can be formatted or saved.

### Right Panel — Analyzer

The analyzer panel has four sections, displayed as tabs or stacked sections:

1. **Path Inspector** (shown when a node is selected in tree view)
2. **Schema Summary**
3. **Search Results** (shown when search is active)
4. **Array Stats** (shown when selected node is an array)

See feature details below.

---

## Feature Specifications

### Input: Paste
- Large textarea, monospace font
- Accepts raw JSON text
- On load: passes text to Rust for parsing
- On parse error: returns error with line and column number, displayed as a banner above the textarea with message e.g. `Parse error at line 4, column 12: expected ',' or '}'`

### Input: URL Fetch
- URL text field
- Headers section: add/remove rows of key + value text inputs. Pre-populated with one empty row. Common suggestions: `Authorization`, `Content-Type`, `Accept`
- Fetch button triggers Tauri command `fetch_url` (see Rust Commands)
- Loading spinner while fetching
- On HTTP error: display status code and message
- On parse error: same error display as paste input

### Input: Open File
- Button triggers native file dialog filtered to `.json` files
- Loads file contents and parses
- Displays filename in viewer header

### JSON Tree Viewer
- Collapsible nodes for objects and arrays
- Color-coded value types: strings (green), numbers (blue), booleans (yellow), null (muted/grey), keys (white/light slate)
- Click any value node to select it — this activates the Path Inspector in the right panel
- Arrays show item count badge next to the key (e.g. `users [42]`)
- Top-level collapse/expand all button

### Raw Editor (Monaco)
- JSON language mode
- Dark theme matching app
- Inline error squiggles with hover messages
- Gutter line numbers
- Format document command available via right-click or Ctrl+Shift+F
- Changes made here are reflected back when switching to tree view

### Save to File
- Triggers Tauri `save_file` command
- Opens native save dialog
- Saves current JSON (formatted, 2-space indent)
- If file was opened from disk, default save path is the same file

### Analyzer: Path Inspector
Activated when user clicks a node in the tree view.

Displays:
- **Dot notation path:** `response.data.users[0].email`
- **Bracket notation path:** `["response"]["data"]["users"][0]["email"]`
- **Value preview:** the actual value at that path
- **Value type:** string / number / boolean / null / object / array

Each path has a **Copy** button that copies it to clipboard with a brief visual confirmation (button flashes "Copied!").

### Analyzer: Schema Summary
Always visible when JSON is loaded. Walks the entire JSON tree and reports:

- Total key count
- Nesting depth (max depth of the tree)
- For each key found: key name, inferred type, whether it appeared in all array items or only some (marked as "optional")
- Any type inconsistencies: if the same key has different types across array items, flag it with a warning icon
- Displayed as a compact scrollable table: Key | Type | Present In | Notes

### Analyzer: Search
- Search bar in the top toolbar triggers this
- Searches all keys and all values in the loaded JSON
- Results displayed in right panel as a list: each result shows the matched key/value and its path
- Clicking a result highlights and expands that node in the tree view
- Search is case-insensitive, live-updating as user types

### Analyzer: Array Stats
Shown in the right panel when the selected node (via tree click) is an array.

Reports:
- Array length
- Item types (are all items the same type? if objects, are keys consistent?)
- If array of primitives: min, max, unique count
- If array of objects: lists all keys found across items, which are present in all vs some

### History / Recents
- Persisted via `tauri-plugin-store` in the app data directory
- Stores up to 50 sessions
- Each session record:
  ```json
  {
    "id": "uuid",
    "nickname": "optional user label",
    "source": "paste | url | file",
    "url": "https://...",
    "headers": [{"key": "Authorization", "value": "Bearer ..."}],
    "filePath": "/path/to/file.json",
    "rawJson": "...",
    "savedAt": "ISO timestamp"
  }
  ```
- History accessible via a sidebar drawer (hamburger icon or "History" button in toolbar)
- Each entry shows: source icon, URL or filename or "Pasted JSON", timestamp, optional nickname
- Clicking an entry loads that session back into the viewer
- User can rename (add nickname) or delete individual entries
- Sessions are saved automatically when JSON is successfully loaded

### Syntax Error Highlighting
- On parse failure, the Rust backend returns a structured error:
  ```json
  { "line": 4, "column": 12, "message": "expected ',' or '}'" }
  ```
- In Raw Editor mode: Monaco jumps to the error line and shows an inline marker
- In Paste mode: error banner shown above the textarea with line/column info
- Tree view shows an empty state with the error message when JSON is invalid

---

## Rust Commands (Tauri `invoke` API)

All commands are defined in Rust and called from the React frontend via `invoke`.

```
fetch_url(url: String, headers: Vec<{key: String, value: String}>) 
  -> Result<String, AppError>
  // Makes HTTP GET request with provided headers, returns raw response body

parse_json(raw: String) 
  -> Result<ParsedJson, AppError>
  // Validates and parses JSON, returns structured result or error with line/col

save_file(content: String, suggested_path: Option<String>) 
  -> Result<String, AppError>
  // Opens native save dialog, writes file, returns saved path

open_file() 
  -> Result<{path: String, content: String}, AppError>
  // Opens native file dialog, reads and returns file content

get_history() 
  -> Result<Vec<HistoryEntry>, AppError>

save_history_entry(entry: HistoryEntry) 
  -> Result<(), AppError>

delete_history_entry(id: String) 
  -> Result<(), AppError>

update_history_nickname(id: String, nickname: String) 
  -> Result<(), AppError>
```

### AppError shape
```rust
struct AppError {
    message: String,
    kind: String,       // "parse_error" | "network_error" | "io_error"
    line: Option<u32>,
    column: Option<u32>,
}
```

---

## UI & Theming

Use Tailwind CSS with shadcn/ui. Target color palette:

| Element | Color |
|---------|-------|
| App background | `slate-950` |
| Panel background | `slate-900` |
| Panel border | `slate-700` |
| Toolbar | `slate-900` |
| Text primary | `slate-100` |
| Text muted | `slate-400` |
| Accent / interactive | `sky-500` |
| String values | `emerald-400` |
| Number values | `sky-400` |
| Boolean values | `amber-400` |
| Null values | `slate-500` |
| Error | `red-400` |

Font: Use `JetBrains Mono` or `Fira Code` for JSON display. System sans-serif for UI chrome.

---

## State Management (Zustand)

Single global store with these slices:

```typescript
interface AppStore {
  // Current session
  rawJson: string | null
  parsedJson: unknown | null
  parseError: ParseError | null
  sourceType: 'paste' | 'url' | 'file' | null
  sourceUrl: string
  sourceHeaders: Header[]
  sourceFilePath: string | null
  
  // UI state
  viewMode: 'tree' | 'raw'
  selectedPath: string | null   // dot-notation path of selected tree node
  searchQuery: string
  
  // History
  history: HistoryEntry[]
  historyOpen: boolean
}
```

---

## File Structure

```
mju/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── fetch.rs       # fetch_url command
│   │   │   ├── json.rs        # parse_json command
│   │   │   ├── files.rs       # save_file, open_file commands
│   │   │   └── history.rs     # history CRUD commands
│   │   └── error.rs           # AppError type
│   └── tauri.conf.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── store/
│   │   └── index.ts           # Zustand store
│   ├── components/
│   │   ├── Toolbar.tsx
│   │   ├── InputPanel/
│   │   │   ├── index.tsx
│   │   │   ├── PasteInput.tsx
│   │   │   ├── UrlFetch.tsx
│   │   │   └── FileInput.tsx
│   │   ├── Viewer/
│   │   │   ├── index.tsx
│   │   │   ├── TreeView.tsx
│   │   │   └── RawEditor.tsx
│   │   ├── Analyzer/
│   │   │   ├── index.tsx
│   │   │   ├── PathInspector.tsx
│   │   │   ├── SchemaSummary.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── ArrayStats.tsx
│   │   └── History/
│   │       ├── Drawer.tsx
│   │       └── HistoryEntry.tsx
│   ├── lib/
│   │   ├── tauri.ts           # typed wrappers around invoke calls
│   │   ├── pathUtils.ts       # dot/bracket path generation from tree node
│   │   └── schemaAnalyzer.ts  # schema walking logic (runs client-side)
│   └── types/
│       └── index.ts
```

---

## V1.1 Features (Do Not Build in V1.0)

### JWT Inline Decoder
- After JSON is loaded, walk the tree and identify any string values that match the JWT pattern (`xxxxx.yyyyy.zzzzz` — three base64url segments)
- Show a small "Decode" chip/badge next to those values in the tree
- Clicking it opens a modal showing:
  - **Header** (decoded, formatted JSON)
  - **Payload** (decoded, formatted JSON)
  - **Expiry** — if `exp` claim present, show human-readable datetime and whether it's expired
- Read-only. No signing or encoding functionality.

### Diff Mode
- Separate view mode accessible from toolbar
- Two side-by-side input panels (each supports paste/url/file with headers)
- Diff output shown below or between panels
- Uses `jsondiffpatch` for structural JSON diffing
- Color coded: green = added, red = removed, yellow = changed
- Can diff any two JSON sources independently of the main viewer session

---

## Build Order (Recommended)

1. Scaffold Tauri + React app, configure Tailwind + shadcn dark theme, set up two-panel layout shell
2. Paste input → Rust JSON parse → Tree viewer (collapsible, typed colors)
3. Raw editor view (Monaco), view toggle, format button
4. File open and save via Tauri dialogs
5. URL fetch with headers (Rust reqwest)
6. Syntax error handling — parse error banner and Monaco markers
7. Analyzer: Path Inspector (click node → show paths with copy buttons)
8. Analyzer: Schema Summary
9. Analyzer: Search (toolbar search → right panel results → highlight in tree)
10. Analyzer: Array Stats
11. History/Recents (drawer, auto-save sessions, load/rename/delete)
12. Polish: keyboard shortcuts, empty states, loading spinners, responsive panel resizing

---

*Spec version: 1.0 — covers MJU v1.0 build scope*
