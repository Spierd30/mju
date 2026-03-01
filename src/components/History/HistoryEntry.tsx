import { useState } from 'react';
import { Globe, FileText, Clipboard, Trash2, Edit2, Check, X } from 'lucide-react';
import type { HistoryEntry } from '../../types';
import { updateHistoryNickname } from '../../lib/tauri';

interface Props {
  entry: HistoryEntry;
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, nickname: string) => void;
}

function SourceIcon({ source }: { source: string }) {
  if (source === 'url') return <Globe size={13} className="text-sky-400" />;
  if (source === 'file') return <FileText size={13} className="text-emerald-400" />;
  return <Clipboard size={13} className="text-slate-400" />;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function HistoryEntryItem({ entry, onLoad, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [nickValue, setNickValue] = useState(entry.nickname ?? '');

  function label(): string {
    if (entry.nickname) return entry.nickname;
    if (entry.source === 'url') return entry.url ?? 'URL fetch';
    if (entry.source === 'file') return entry.filePath?.split('/').pop() ?? 'File';
    return 'Pasted JSON';
  }

  async function saveNick() {
    await updateHistoryNickname(entry.id, nickValue);
    onRename(entry.id, nickValue);
    setEditing(false);
  }

  function cancelEdit() {
    setNickValue(entry.nickname ?? '');
    setEditing(false);
  }

  return (
    <div className="group flex items-start gap-2 px-3 py-2.5 hover:bg-slate-800 rounded cursor-pointer transition-colors">
      <div className="mt-0.5 shrink-0">
        <SourceIcon source={entry.source} />
      </div>
      <div className="flex-1 min-w-0" onClick={() => onLoad(entry)}>
        {editing ? (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={nickValue}
              onChange={(e) => setNickValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveNick(); if (e.key === 'Escape') cancelEdit(); }}
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              placeholder="Add a label..."
            />
            <button onClick={saveNick} className="text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-300"><X size={12} /></button>
          </div>
        ) : (
          <div className="text-xs text-slate-200 truncate">{label()}</div>
        )}
        <div className="text-xs text-slate-500 mt-0.5">{formatTime(entry.savedAt)}</div>
      </div>
      {!editing && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="text-slate-500 hover:text-sky-400 transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
