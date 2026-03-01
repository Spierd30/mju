import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { toDotNotation } from '../../lib/pathUtils';

interface JsonTreeProps {
  value: unknown;
  onSelect: (path: string) => void;
  selectedPath: string | null;
  searchQuery?: string;
}

interface NodeProps {
  value: unknown;
  keyName?: string | number;
  path: (string | number)[];
  depth: number;
  onSelect: (path: string) => void;
  selectedPath: string | null;
  searchQuery?: string;
  isLast: boolean;
}

function getType(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-500/30 text-yellow-200 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function PrimitiveValue({ value, query }: { value: unknown; query?: string }) {
  if (value === null) {
    return <span className="text-slate-500">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-amber-400">{String(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-sky-400">{String(value)}</span>;
  }
  if (typeof value === 'string') {
    const display = value.length > 120 ? value.slice(0, 120) + '…' : value;
    return (
      <span className="text-emerald-400">
        "{query ? highlight(display, query) : display}"
      </span>
    );
  }
  return <span className="text-slate-400">{String(value)}</span>;
}

function JsonNode({ value, keyName, path, depth, onSelect, selectedPath, searchQuery, isLast }: NodeProps) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const type = getType(value);
  const dotPath = toDotNotation(path);
  const isSelected = dotPath === selectedPath && dotPath !== '';
  const isPrimitive = type !== 'object' && type !== 'array';

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(dotPath);
    },
    [dotPath, onSelect]
  );

  const comma = !isLast ? ',' : '';

  const keyLabel = keyName !== undefined ? (
    <span
      className="text-slate-300 cursor-pointer hover:text-sky-300 transition-colors"
      onClick={handleClick}
    >
      {typeof keyName === 'number'
        ? <span className="text-slate-500">{keyName}</span>
        : searchQuery
        ? <span>{highlight(String(keyName), searchQuery)}</span>
        : String(keyName)
      }
      <span className="text-slate-600">: </span>
    </span>
  ) : null;

  if (isPrimitive) {
    return (
      <div
        className={`flex items-center pl-4 py-0.5 rounded cursor-pointer transition-colors hover:bg-slate-800/60 ${isSelected ? 'bg-slate-700/60' : ''}`}
        style={{ marginLeft: depth * 16 }}
        onClick={handleClick}
      >
        {keyLabel}
        <PrimitiveValue value={value} query={searchQuery} />
        <span className="text-slate-600">{comma}</span>
      </div>
    );
  }

  const isArray = type === 'array';
  const entries = isArray
    ? (value as unknown[])
    : Object.entries(value as Record<string, unknown>);
  const count = Array.isArray(entries) ? entries.length : 0;
  const openBrace = isArray ? '[' : '{';
  const closeBrace = isArray ? ']' : '}';

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        className={`flex items-center py-0.5 rounded cursor-pointer transition-colors hover:bg-slate-800/60 ${isSelected ? 'bg-slate-700/60' : ''}`}
        onClick={handleClick}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
          className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300 mr-1 shrink-0"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {keyLabel}
        <span className="text-slate-500">{openBrace}</span>
        {collapsed && (
          <>
            <span className="text-slate-600 text-xs ml-1 italic">
              {count} {isArray ? 'item' : 'key'}{count !== 1 ? 's' : ''}
            </span>
            <span className="text-slate-500 ml-1">{closeBrace}</span>
            <span className="text-slate-600">{comma}</span>
          </>
        )}
        {!collapsed && count === 0 && (
          <>
            <span className="text-slate-500">{closeBrace}</span>
            <span className="text-slate-600">{comma}</span>
          </>
        )}
      </div>

      {!collapsed && count > 0 && (
        <>
          <div>
            {isArray
              ? (value as unknown[]).map((item, i) => (
                  <JsonNode
                    key={i}
                    value={item}
                    keyName={i}
                    path={[...path, i]}
                    depth={depth + 1}
                    onSelect={onSelect}
                    selectedPath={selectedPath}
                    searchQuery={searchQuery}
                    isLast={i === (value as unknown[]).length - 1}
                  />
                ))
              : Object.entries(value as Record<string, unknown>).map(([k, v], i, arr) => (
                  <JsonNode
                    key={k}
                    value={v}
                    keyName={k}
                    path={[...path, k]}
                    depth={depth + 1}
                    onSelect={onSelect}
                    selectedPath={selectedPath}
                    searchQuery={searchQuery}
                    isLast={i === arr.length - 1}
                  />
                ))}
          </div>
          <div
            style={{ marginLeft: depth * 16 }}
            className="pl-5 py-0.5 text-slate-500"
          >
            {closeBrace}
            <span className="text-slate-600">{comma}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function JsonTree({ value, onSelect, selectedPath, searchQuery }: JsonTreeProps) {
  return (
    <div className="font-mono text-sm leading-relaxed">
      <JsonNode
        value={value}
        path={[]}
        depth={0}
        onSelect={onSelect}
        selectedPath={selectedPath}
        searchQuery={searchQuery}
        isLast
      />
    </div>
  );
}
