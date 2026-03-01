import { useState, useEffect } from 'react';
import { Code2, Save, Copy, Check, AlignLeft, GitBranch, Clock, Search } from 'lucide-react';
import { useStore } from '../store';
import { saveFile } from '../lib/tauri';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getVersion } from '@tauri-apps/api/app';

export function Toolbar() {
  const {
    rawJson,
    parsedJson,
    viewMode,
    searchQuery,
    sourceFilePath,
    setViewMode,
    setRawJson,
    setSearchQuery,
    setHistoryOpen,
  } = useStore();

  const [copyDone, setCopyDone] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  async function handleFormat() {
    if (!parsedJson) return;
    const formatted = JSON.stringify(parsedJson, null, 2);
    setRawJson(formatted);
  }

  async function handleSave() {
    if (!parsedJson && !rawJson) return;
    const content = parsedJson ? JSON.stringify(parsedJson, null, 2) : (rawJson ?? '');
    await saveFile(content, sourceFilePath ?? undefined);
  }

  async function handleCopyAll() {
    if (!rawJson) return;
    try {
      await writeText(rawJson);
    } catch {
      await navigator.clipboard.writeText(rawJson);
    }
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 1500);
  }

  const hasJson = rawJson !== null && rawJson !== '';

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-700 shrink-0">
      {/* App name */}
      <div className="flex items-center gap-1.5 mr-3">
        <Code2 size={18} className="text-sky-500" />
        <span className="font-bold text-slate-100 tracking-tight">MJU</span>
        {version && <span className="text-xs text-slate-500">v{version}</span>}
      </div>

      {/* Format */}
      <button
        onClick={handleFormat}
        disabled={!parsedJson}
        title="Format JSON (Ctrl+Shift+F in editor)"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
      >
        <AlignLeft size={13} /> Format
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!hasJson}
        title="Save to file"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
      >
        <Save size={13} /> Save
      </button>

      {/* Copy All */}
      <button
        onClick={handleCopyAll}
        disabled={!hasJson}
        title="Copy raw JSON to clipboard"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
          copyDone
            ? 'bg-emerald-800 text-emerald-300'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
        }`}
      >
        {copyDone ? <Check size={13} /> : <Copy size={13} />}
        {copyDone ? 'Copied!' : 'Copy All'}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search keys/values..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded pl-7 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors w-48"
        />
      </div>

      {/* View toggle */}
      <div className="flex bg-slate-800 rounded border border-slate-700 overflow-hidden">
        <button
          onClick={() => setViewMode('tree')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === 'tree'
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch size={12} /> Tree
        </button>
        <button
          onClick={() => setViewMode('raw')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === 'raw'
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 size={12} /> Raw
        </button>
      </div>

      {/* History */}
      <button
        onClick={() => setHistoryOpen(true)}
        title="View history"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
      >
        <Clock size={13} /> History
      </button>
    </div>
  );
}
