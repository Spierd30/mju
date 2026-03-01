import { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { PathInspector } from './PathInspector';
import { SchemaSummary } from './SchemaSummary';
import { SearchResults } from './SearchResults';
import { ArrayStats } from './ArrayStats';
import { parsePath, getValueAtPath } from '../../lib/pathUtils';

const TABS = ['Path', 'Schema', 'Search', 'Array'] as const;
type Tab = (typeof TABS)[number];

export function Analyzer() {
  const { selectedPath, parsedJson, searchQuery } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('Schema');

  // Auto-switch to relevant tab
  const isSelectedArray = useMemo(() => {
    if (!selectedPath || !parsedJson) return false;
    const val = getValueAtPath(parsedJson, parsePath(selectedPath));
    return Array.isArray(val);
  }, [selectedPath, parsedJson]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex border-b border-slate-700 shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const showDot =
            (tab === 'Path' && selectedPath) ||
            (tab === 'Array' && isSelectedArray) ||
            (tab === 'Search' && searchQuery.trim());

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {showDot && (
                <span className="absolute top-1.5 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-3">
        {activeTab === 'Path' && <PathInspector />}
        {activeTab === 'Schema' && <SchemaSummary />}
        {activeTab === 'Search' && <SearchResults />}
        {activeTab === 'Array' && <ArrayStats />}
      </div>
    </div>
  );
}
