import { useEffect, useRef } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useStore } from '../../store';
import { parseJson } from '../../lib/tauri';

export function RawEditor() {
  const { rawJson, parseError, setRawJson, setParsedJson, setParseError } = useStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Update error markers when parseError changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    if (parseError?.line != null) {
      monaco.editor.setModelMarkers(model, 'json', [
        {
          severity: monaco.MarkerSeverity.Error,
          message: parseError.message,
          startLineNumber: parseError.line,
          startColumn: parseError.column ?? 1,
          endLineNumber: parseError.line,
          endColumn: (parseError.column ?? 1) + 1,
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, 'json', []);
    }
  }, [parseError]);

  async function handleChange(value: string | undefined) {
    if (value === undefined) return;
    setRawJson(value);

    // Live parse to update error markers
    if (value.trim()) {
      const result = await parseJson(value);
      if ('error' in result) {
        setParseError(result.error);
        setParsedJson(null);
      } else {
        setParseError(null);
        setParsedJson(result.data);
      }
    } else {
      setParseError(null);
      setParsedJson(null);
    }
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={rawJson ?? ''}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        renderLineHighlight: 'line',
      }}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Format shortcut Ctrl+Shift+F
        editor.addAction({
          id: 'format-json',
          label: 'Format JSON',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
          ],
          run: async (ed) => {
            await ed.getAction('editor.action.formatDocument')?.run();
          },
        });
      }}
    />
  );
}
