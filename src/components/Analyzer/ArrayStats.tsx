import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import { analyzeArray } from '../../lib/schemaAnalyzer';
import { parsePath, getValueAtPath } from '../../lib/pathUtils';

export function ArrayStats() {
  const { selectedPath, parsedJson } = useStore();

  const stats = useMemo(() => {
    if (!selectedPath || parsedJson === null) return null;
    const parts = parsePath(selectedPath);
    const value = getValueAtPath(parsedJson, parts);
    if (!Array.isArray(value)) return null;
    return analyzeArray(value);
  }, [selectedPath, parsedJson]);

  if (!selectedPath) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Select an array node in the tree
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Selected node is not an array
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800 rounded px-2 py-1.5">
          <div className="text-slate-500">Length</div>
          <div className="text-slate-100 font-semibold">{stats.length}</div>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1.5">
          <div className="text-slate-500">Item types</div>
          <div className="text-slate-100 font-semibold">{stats.itemTypes.join(', ') || 'mixed'}</div>
        </div>
        {stats.min !== undefined && (
          <div className="bg-slate-800 rounded px-2 py-1.5">
            <div className="text-slate-500">Min</div>
            <div className="text-sky-400 font-semibold font-mono">{stats.min}</div>
          </div>
        )}
        {stats.max !== undefined && (
          <div className="bg-slate-800 rounded px-2 py-1.5">
            <div className="text-slate-500">Max</div>
            <div className="text-sky-400 font-semibold font-mono">{stats.max}</div>
          </div>
        )}
        {stats.uniqueCount !== undefined && (
          <div className="bg-slate-800 rounded px-2 py-1.5">
            <div className="text-slate-500">Unique values</div>
            <div className="text-slate-100 font-semibold">{stats.uniqueCount}</div>
          </div>
        )}
      </div>

      {stats.objectKeys && stats.objectKeys.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Object keys across items</div>
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-1 pr-2 font-medium">Key</th>
                  <th className="text-left py-1 pr-2 font-medium">Type</th>
                  <th className="text-left py-1 font-medium">Present</th>
                </tr>
              </thead>
              <tbody>
                {stats.objectKeys.map((field) => (
                  <tr key={field.key} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-1 pr-2 font-mono text-slate-300 truncate max-w-[100px]">{field.key}</td>
                    <td className="py-1 pr-2 text-slate-400">{[...field.types].join(' | ')}</td>
                    <td className="py-1 flex items-center gap-1">
                      <span className={field.optional ? 'text-amber-500' : 'text-emerald-500'}>
                        {field.presentCount}/{field.totalCount}
                      </span>
                      {field.hasTypeConflict && <AlertTriangle size={10} className="text-red-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
