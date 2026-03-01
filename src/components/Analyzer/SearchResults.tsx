import { useMemo } from 'react';
import { useStore } from '../../store';
import { searchJson } from '../../lib/schemaAnalyzer';

function typeColor(value: unknown): string {
  if (value === null) return 'text-slate-500';
  if (typeof value === 'string') return 'text-emerald-400';
  if (typeof value === 'number') return 'text-sky-400';
  if (typeof value === 'boolean') return 'text-amber-400';
  return 'text-slate-400';
}

export function SearchResults() {
  const { parsedJson, searchQuery, setSelectedPath } = useStore();

  const results = useMemo(() => {
    if (!parsedJson || !searchQuery.trim()) return [];
    return searchJson(parsedJson, searchQuery);
  }, [parsedJson, searchQuery]);

  if (!searchQuery.trim()) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Type in the search bar to find keys and values
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-6">
        No results for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-500 mb-2">{results.length} result{results.length !== 1 ? 's' : ''}</div>
      <div className="space-y-1 overflow-auto max-h-full">
        {results.map((result, i) => (
          <button
            key={i}
            onClick={() => setSelectedPath(result.path)}
            className="w-full text-left px-2 py-2 rounded bg-slate-800 hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-xs px-1 rounded ${result.matchType === 'key' ? 'bg-sky-900 text-sky-300' : 'bg-emerald-900 text-emerald-300'}`}>
                {result.matchType}
              </span>
              <span className="font-mono text-xs text-slate-400 truncate">{result.path || '(root)'}</span>
            </div>
            <div className={`font-mono text-xs truncate ${typeColor(result.value)}`}>
              {result.matchType === 'key'
                ? result.matchText
                : typeof result.value === 'string'
                ? `"${result.value}"`
                : String(result.value)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
