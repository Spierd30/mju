import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { useStore } from '../../store';
import { parseJson } from '../../lib/tauri';
import { getHistory, deleteHistoryEntry } from '../../lib/tauri';
import { HistoryEntryItem } from './HistoryEntry';
import type { HistoryEntry } from '../../types';

export function HistoryDrawer() {
  const {
    historyOpen,
    history,
    setHistoryOpen,
    setHistory,
    loadSession,
    setParsedJson,
    setParseError,
  } = useStore();

  useEffect(() => {
    if (historyOpen) {
      getHistory().then(setHistory);
    }
  }, [historyOpen]);

  async function handleLoad(entry: HistoryEntry) {
    loadSession(entry);
    // Re-parse the JSON
    if (entry.rawJson) {
      const result = await parseJson(entry.rawJson);
      if ('data' in result) {
        setParsedJson(result.data);
        setParseError(null);
      } else {
        setParsedJson(null);
        setParseError(result.error);
      }
    }
    setHistoryOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteHistoryEntry(id);
    setHistory(history.filter((e) => e.id !== id));
  }

  function handleRename(id: string, nickname: string) {
    setHistory(
      history.map((e) =>
        e.id === id ? { ...e, nickname: nickname || undefined } : e
      )
    );
  }

  if (!historyOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setHistoryOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-100 font-medium">
            <Clock size={15} />
            <span>History</span>
            {history.length > 0 && (
              <span className="text-xs text-slate-500">({history.length})</span>
            )}
          </div>
          <button
            onClick={() => setHistoryOpen(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto py-1">
          {history.length === 0 ? (
            <div className="text-slate-600 text-sm text-center py-10">
              No history yet
            </div>
          ) : (
            history.map((entry) => (
              <HistoryEntryItem
                key={entry.id}
                entry={entry}
                onLoad={handleLoad}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
