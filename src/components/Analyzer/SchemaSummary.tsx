import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import { analyzeSchema } from '../../lib/schemaAnalyzer';

export function SchemaSummary() {
  const { parsedJson } = useStore();

  const schema = useMemo(() => {
    if (parsedJson === null || parsedJson === undefined) return null;
    return analyzeSchema(parsedJson);
  }, [parsedJson]);

  if (!schema) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Load JSON to see schema summary
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-4 text-xs">
        <div className="bg-slate-800 rounded px-2 py-1.5">
          <div className="text-slate-500">Total keys</div>
          <div className="text-slate-100 font-semibold">{schema.totalKeys}</div>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1.5">
          <div className="text-slate-500">Max depth</div>
          <div className="text-slate-100 font-semibold">{schema.maxDepth}</div>
        </div>
      </div>

      {schema.fields.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="text-left py-1 pr-2 font-medium">Key</th>
                <th className="text-left py-1 pr-2 font-medium">Type</th>
                <th className="text-left py-1 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map((field) => (
                <tr key={field.key} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-1 pr-2 font-mono text-slate-300 truncate max-w-[120px]" title={field.key}>
                    {field.key}
                  </td>
                  <td className="py-1 pr-2 text-slate-400">
                    {[...field.types].join(' | ')}
                  </td>
                  <td className="py-1 flex items-center gap-1">
                    {field.optional && (
                      <span className="text-amber-500 text-xs">optional</span>
                    )}
                    {field.hasTypeConflict && (
                      <span className="flex items-center gap-0.5 text-red-400">
                        <AlertTriangle size={10} /> conflict
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
