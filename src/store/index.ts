import { create } from 'zustand';
import type { Header, HistoryEntry, ParseError, SourceType, ViewMode } from '../types';

interface AppStore {
  // Current session
  rawJson: string | null;
  parsedJson: unknown | null;
  parseError: ParseError | null;
  sourceType: SourceType;
  sourceUrl: string;
  sourceHeaders: Header[];
  sourceFilePath: string | null;

  // UI state
  viewMode: ViewMode;
  selectedPath: string | null;
  searchQuery: string;
  isLoading: boolean;
  historyOpen: boolean;

  // History
  history: HistoryEntry[];

  // Actions
  setRawJson: (raw: string | null) => void;
  setParsedJson: (json: unknown | null) => void;
  setParseError: (err: ParseError | null) => void;
  setSourceType: (t: SourceType) => void;
  setSourceUrl: (url: string) => void;
  setSourceHeaders: (headers: Header[]) => void;
  setSourceFilePath: (path: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedPath: (path: string | null) => void;
  setSearchQuery: (q: string) => void;
  setIsLoading: (loading: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setHistory: (entries: HistoryEntry[]) => void;
  loadSession: (entry: HistoryEntry) => void;
}

export const useStore = create<AppStore>((set) => ({
  rawJson: null,
  parsedJson: null,
  parseError: null,
  sourceType: null,
  sourceUrl: '',
  sourceHeaders: [{ key: '', value: '' }],
  sourceFilePath: null,
  viewMode: 'tree',
  selectedPath: null,
  searchQuery: '',
  isLoading: false,
  historyOpen: false,
  history: [],

  setRawJson: (raw) => set({ rawJson: raw }),
  setParsedJson: (json) => set({ parsedJson: json }),
  setParseError: (err) => set({ parseError: err }),
  setSourceType: (t) => set({ sourceType: t }),
  setSourceUrl: (url) => set({ sourceUrl: url }),
  setSourceHeaders: (headers) => set({ sourceHeaders: headers }),
  setSourceFilePath: (path) => set({ sourceFilePath: path }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setHistoryOpen: (open) => set({ historyOpen: open }),
  setHistory: (entries) => set({ history: entries }),
  loadSession: (entry) =>
    set({
      rawJson: entry.rawJson,
      parsedJson: null,
      parseError: null,
      sourceType: entry.source,
      sourceUrl: entry.url ?? '',
      sourceHeaders: entry.headers ?? [{ key: '', value: '' }],
      sourceFilePath: entry.filePath ?? null,
      selectedPath: null,
      searchQuery: '',
    }),
}));
