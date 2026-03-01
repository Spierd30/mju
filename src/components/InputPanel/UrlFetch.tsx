import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { fetchUrl, parseJson, saveHistoryEntry } from '../../lib/tauri';
import type { Header, ParseError } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function UrlFetch() {
  const {
    sourceUrl,
    sourceHeaders,
    isLoading,
    parseError,
    setSourceUrl,
    setSourceHeaders,
    setRawJson,
    setParsedJson,
    setParseError,
    setSourceType,
    setIsLoading,
  } = useStore();

  const [fetchError, setFetchError] = useState<string | null>(null);

  function updateHeader(idx: number, field: 'key' | 'value', val: string) {
    const next = sourceHeaders.map((h, i) => (i === idx ? { ...h, [field]: val } : h));
    setSourceHeaders(next);
  }

  function addHeader() {
    setSourceHeaders([...sourceHeaders, { key: '', value: '' }]);
  }

  function removeHeader(idx: number) {
    setSourceHeaders(sourceHeaders.filter((_, i) => i !== idx));
  }

  async function handleFetch() {
    if (!sourceUrl.trim()) return;
    setIsLoading(true);
    setParseError(null);
    setFetchError(null);

    const activeHeaders: Header[] = sourceHeaders.filter((h) => h.key.trim());
    const fetchResult = await fetchUrl(sourceUrl, activeHeaders);

    if ('error' in fetchResult) {
      setIsLoading(false);
      setFetchError(fetchResult.error.message);
      return;
    }

    const raw = fetchResult.data;
    const parseResult = await parseJson(raw);
    setIsLoading(false);

    if ('error' in parseResult) {
      setParseError(parseResult.error as ParseError);
      setRawJson(raw);
      setParsedJson(null);
    } else {
      setRawJson(raw);
      setParsedJson(parseResult.data);
      setSourceType('url');
      setParseError(null);

      const entry = {
        id: generateId(),
        source: 'url' as const,
        url: sourceUrl,
        headers: activeHeaders,
        rawJson: raw,
        savedAt: new Date().toISOString(),
      };
      await saveHistoryEntry(entry);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(fetchError || parseError) && (
        <div className="bg-red-950/50 border border-red-800 rounded px-3 py-2 text-red-400 text-sm">
          {fetchError ?? `Parse error${parseError?.line != null ? ` at line ${parseError.line}, col ${parseError.column}` : ''}: ${parseError?.message}`}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://api.example.com/data.json"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
          className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          onClick={handleFetch}
          disabled={isLoading || !sourceUrl.trim()}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Fetching...' : 'Fetch'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Headers</span>
          <button
            onClick={addHeader}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <Plus size={12} /> Add header
          </button>
        </div>
        {sourceHeaders.map((h, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              placeholder="Authorization"
              value={h.key}
              onChange={(e) => updateHeader(i, 'key', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <input
              placeholder="Bearer token..."
              value={h.value}
              onChange={(e) => updateHeader(i, 'value', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              onClick={() => removeHeader(i)}
              className="text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
