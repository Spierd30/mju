import { invoke } from '@tauri-apps/api/core';
import type { Header, HistoryEntry, ParseError } from '../types';

export interface AppError {
  message: string;
  kind: string;
  line?: number;
  column?: number;
}

function parseError(err: unknown): AppError {
  if (typeof err === 'string') {
    try {
      return JSON.parse(err) as AppError;
    } catch {
      return { message: err, kind: 'unknown' };
    }
  }
  return { message: String(err), kind: 'unknown' };
}

export async function parseJson(raw: string): Promise<{ data: unknown } | { error: ParseError }> {
  try {
    const data = await invoke<unknown>('parse_json', { raw });
    return { data };
  } catch (err) {
    return { error: parseError(err) };
  }
}

export async function fetchUrl(
  url: string,
  headers: Header[]
): Promise<{ data: string } | { error: AppError }> {
  try {
    const data = await invoke<string>('fetch_url', { url, headers });
    return { data };
  } catch (err) {
    return { error: parseError(err) };
  }
}

export async function openFile(): Promise<
  { path: string; content: string } | { error: AppError }
> {
  try {
    const result = await invoke<{ path: string; content: string }>('open_file');
    return result;
  } catch (err) {
    return { error: parseError(err) };
  }
}

export async function saveFile(
  content: string,
  suggestedPath?: string
): Promise<{ path: string } | { error: AppError }> {
  try {
    const path = await invoke<string>('save_file', {
      content,
      suggestedPath: suggestedPath ?? null,
    });
    return { path };
  } catch (err) {
    return { error: parseError(err) };
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    return await invoke<HistoryEntry[]>('get_history');
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  try {
    await invoke('save_history_entry', { entry });
  } catch {
    // ignore
  }
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  try {
    await invoke('delete_history_entry', { id });
  } catch {
    // ignore
  }
}

export async function updateHistoryNickname(id: string, nickname: string): Promise<void> {
  try {
    await invoke('update_history_nickname', { id, nickname });
  } catch {
    // ignore
  }
}
