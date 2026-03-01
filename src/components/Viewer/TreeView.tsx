import { useCallback } from 'react';
import { useStore } from '../../store';
import { JsonTree } from './JsonTree';

export function TreeView() {
  const { parsedJson, parseError, selectedPath, searchQuery, setSelectedPath } = useStore();

  const handleSelect = useCallback(
    (path: string) => setSelectedPath(path),
    [setSelectedPath]
  );

  if (parseError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-sm">Invalid JSON</p>
          <p className="text-slate-500 text-xs mt-1">{parseError.message}</p>
        </div>
      </div>
    );
  }

  if (parsedJson === null || parsedJson === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-600">
          <p className="text-4xl mb-3">&#123; &#125;</p>
          <p className="text-sm">No JSON loaded</p>
          <p className="text-xs mt-1">Paste, fetch a URL, or open a file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 overflow-auto h-full">
      <JsonTree
        value={parsedJson}
        onSelect={handleSelect}
        selectedPath={selectedPath}
        searchQuery={searchQuery}
      />
    </div>
  );
}
