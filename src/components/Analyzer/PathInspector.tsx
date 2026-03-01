import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useStore } from '../../store';
import { toDotNotation, toBracketNotation, parsePath, getValueAtPath, getValueType } from '../../lib/pathUtils';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
        copied
          ? 'bg-emerald-800 text-emerald-300'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export function PathInspector() {
  const { selectedPath, parsedJson } = useStore();

  if (!selectedPath) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Click a node in the tree to inspect its path
      </div>
    );
  }

  const parts = parsePath(selectedPath);
  const dotPath = toDotNotation(parts);
  const bracketPath = toBracketNotation(parts);
  const value = getValueAtPath(parsedJson, parts);
  const valueType = getValueType(value);

  function renderValue() {
    if (value === null) return <span className="text-slate-500">null</span>;
    if (typeof value === 'string') return <span className="text-emerald-400">"{value}"</span>;
    if (typeof value === 'number') return <span className="text-sky-400">{value}</span>;
    if (typeof value === 'boolean') return <span className="text-amber-400">{String(value)}</span>;
    if (typeof value === 'object') {
      const len = Array.isArray(value) ? (value as unknown[]).length : Object.keys(value as object).length;
      return (
        <span className="text-slate-400">
          {Array.isArray(value) ? `Array [${len}]` : `Object {${len} keys}`}
        </span>
      );
    }
    return <span className="text-slate-400">{String(value)}</span>;
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Dot notation</div>
          <div className="flex items-start gap-2">
            <code className="flex-1 font-mono text-sky-300 text-xs bg-slate-800 px-2 py-1.5 rounded break-all">
              {dotPath || '.'}
            </code>
            <CopyButton text={dotPath} />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Bracket notation</div>
          <div className="flex items-start gap-2">
            <code className="flex-1 font-mono text-sky-300 text-xs bg-slate-800 px-2 py-1.5 rounded break-all">
              {bracketPath || '[]'}
            </code>
            <CopyButton text={bracketPath} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Type:</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">
            {valueType}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Value preview</div>
          <div className="font-mono text-xs bg-slate-800 px-2 py-1.5 rounded break-all max-h-32 overflow-auto">
            {renderValue()}
          </div>
        </div>
      </div>
    </div>
  );
}
