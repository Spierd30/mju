export interface ParseError {
  message: string;
  kind: string;
  line?: number;
  column?: number;
}

export interface Header {
  key: string;
  value: string;
}

export interface HistoryEntry {
  id: string;
  nickname?: string;
  source: 'paste' | 'url' | 'file';
  url?: string;
  headers?: Header[];
  filePath?: string;
  rawJson: string;
  savedAt: string;
}

export type ViewMode = 'tree' | 'raw';
export type SourceType = 'paste' | 'url' | 'file' | null;

export interface SchemaField {
  key: string;
  types: Set<string>;
  presentCount: number;
  totalCount: number;
  optional: boolean;
  hasTypeConflict: boolean;
}

export interface SchemaSummary {
  totalKeys: number;
  maxDepth: number;
  fields: SchemaField[];
}

export interface SearchResult {
  path: string;
  matchType: 'key' | 'value';
  matchText: string;
  value: unknown;
}

export interface ArrayStats {
  length: number;
  itemTypes: string[];
  allSameType: boolean;
  min?: number;
  max?: number;
  uniqueCount?: number;
  objectKeys?: SchemaField[];
}
