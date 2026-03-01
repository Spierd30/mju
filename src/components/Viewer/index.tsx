import { useStore } from '../../store';
import { TreeView } from './TreeView';
import { RawEditor } from './RawEditor';

export function Viewer() {
  const { viewMode, sourceFilePath, parsedJson } = useStore();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {sourceFilePath && parsedJson !== null && (
        <div className="px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs text-slate-400 font-mono truncate">
          {sourceFilePath}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'tree' ? <TreeView /> : <RawEditor />}
      </div>
    </div>
  );
}
