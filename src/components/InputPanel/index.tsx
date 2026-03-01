import { useState } from 'react';
import { PasteInput } from './PasteInput';
import { UrlFetch } from './UrlFetch';
import { FileInput } from './FileInput';

const TABS = ['Paste', 'URL Fetch', 'Open File'] as const;
type Tab = (typeof TABS)[number];

export function InputPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Paste');

  return (
    <div className="flex flex-col bg-slate-900 border-b border-slate-700" style={{ minHeight: 180, maxHeight: 280 }}>
      <div className="flex border-b border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {activeTab === 'Paste' && <PasteInput />}
        {activeTab === 'URL Fetch' && <UrlFetch />}
        {activeTab === 'Open File' && <FileInput />}
      </div>
    </div>
  );
}
