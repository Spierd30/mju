import { FolderOpen } from 'lucide-react';
import { useStore } from '../../store';
import { openFile, parseJson, saveHistoryEntry } from '../../lib/tauri';
import type { ParseError } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FileInput() {
  const {
    sourceFilePath,
    isLoading,
    parseError,
    setSourceFilePath,
    setRawJson,
    setParsedJson,
    setParseError,
    setSourceType,
    setIsLoading,
  } = useStore();

  async function handleOpen() {
    setIsLoading(true);
    setParseError(null);

    const result = await openFile();

    if ('error' in result) {
      setIsLoading(false);
      if (result.error.message !== 'No file selected') {
        setParseError({ message: result.error.message, kind: 'io_error' });
      }
      return;
    }

    const { path, content } = result;
    const parseResult = await parseJson(content);
    setIsLoading(false);

    if ('error' in parseResult) {
      setParseError(parseResult.error as ParseError);
      setRawJson(content);
      setParsedJson(null);
      setSourceFilePath(path);
    } else {
      setRawJson(content);
      setParsedJson(parseResult.data);
      setSourceType('file');
      setSourceFilePath(path);
      setParseError(null);

      const entry = {
        id: generateId(),
        source: 'file' as const,
        filePath: path,
        rawJson: content,
        savedAt: new Date().toISOString(),
      };
      await saveHistoryEntry(entry);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {parseError && (
        <div className="bg-red-950/50 border border-red-800 rounded px-3 py-2 text-red-400 text-sm">
          {parseError.message}
        </div>
      )}
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 transition-colors"
      >
        <FolderOpen size={16} />
        {isLoading ? 'Opening...' : 'Browse for JSON file...'}
      </button>
      {sourceFilePath && (
        <div className="text-xs text-slate-400 font-mono truncate" title={sourceFilePath}>
          {sourceFilePath}
        </div>
      )}
    </div>
  );
}
