import { useEffect, useRef, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { InputPanel } from './components/InputPanel';
import { Viewer } from './components/Viewer';
import { Analyzer } from './components/Analyzer';
import { HistoryDrawer } from './components/History/Drawer';
import { useStore } from './store';
import { getHistory } from './lib/tauri';

export function App() {
  const setHistory = useStore((s) => s.setHistory);
  const [leftWidth, setLeftWidth] = useState(55); // percent
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  function onMouseDown() {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(80, Math.max(20, pct)));
    }

    function onMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <Toolbar />

      <div ref={containerRef} className="flex flex-1 min-h-0">
        {/* Left Panel */}
        <div
          className="flex flex-col min-h-0 border-r border-slate-700"
          style={{ width: `${leftWidth}%` }}
        >
          <InputPanel />
          <Viewer />
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1 bg-slate-700 hover:bg-sky-500 cursor-col-resize transition-colors shrink-0"
          title="Drag to resize"
        />

        {/* Right Panel */}
        <div
          className="flex flex-col min-h-0"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="px-3 py-2 border-b border-slate-700 bg-slate-900 shrink-0">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Analyzer</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Analyzer />
          </div>
        </div>
      </div>

      <HistoryDrawer />
    </div>
  );
}

export default App;
