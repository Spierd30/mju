import { useState } from 'react';
import { useStore } from '../../store';
import { parseJson } from '../../lib/tauri';
import { saveHistoryEntry } from '../../lib/tauri';
import type { ParseError } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PasteInput() {
  const {
    parseError,
    isLoading,
    setRawJson,
    setParsedJson,
    setParseError,
    setSourceType,
    setIsLoading,
  } = useStore();

  const rawJson = useStore((s) => s.rawJson);
  const [text, setText] = useState(rawJson ?? '');

  async function handleLoad() {
    if (!text.trim()) return;
    setIsLoading(true);
    setParseError(null);

    const result = await parseJson(text);
    setIsLoading(false);

    if ('error' in result) {
      setParseError(result.error as ParseError);
      setRawJson(text);
      setParsedJson(null);
    } else {
      setRawJson(text);
      setParsedJson(result.data);
      setSourceType('paste');
      setParseError(null);

      const entry = {
        id: generateId(),
        source: 'paste' as const,
        rawJson: text,
        savedAt: new Date().toISOString(),
      };
      await saveHistoryEntry(entry);
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {parseError && (
        <div className="bg-red-950/50 border border-red-800 rounded px-3 py-2 text-red-400 text-sm">
          <span className="font-semibold">Parse error</span>
          {parseError.line != null && (
            <span> at line {parseError.line}, column {parseError.column}</span>
          )}
          : {parseError.message}
        </div>
      )}
      <textarea
        className="flex-1 w-full bg-slate-950 border border-slate-700 rounded p-3 font-mono text-sm text-slate-100 placeholder-slate-600 resize-none focus:outline-none focus:border-sky-500 transition-colors"
        placeholder="Paste your JSON here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'Enter') handleLoad();
        }}
        spellCheck={false}
      />
      <button
        onClick={handleLoad}
        disabled={isLoading || !text.trim()}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded text-sm font-medium transition-colors"
      >
        {isLoading ? 'Parsing...' : 'Load JSON'}
      </button>
      <p className="text-xs text-slate-500">Ctrl+Enter to load</p>
    </div>
  );
}
