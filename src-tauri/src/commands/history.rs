use crate::error::AppError;
use serde::{Deserialize, Serialize};
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "history.json";
const HISTORY_KEY: &str = "entries";
const MAX_ENTRIES: usize = 50;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryHeader {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryEntry {
    pub id: String,
    pub nickname: Option<String>,
    pub source: String, // "paste" | "url" | "file"
    pub url: Option<String>,
    pub headers: Option<Vec<HistoryHeader>>,
    #[serde(rename = "filePath")]
    pub file_path: Option<String>,
    #[serde(rename = "rawJson")]
    pub raw_json: String,
    #[serde(rename = "savedAt")]
    pub saved_at: String,
}

#[tauri::command]
pub fn get_history(app: tauri::AppHandle) -> Result<Vec<HistoryEntry>, String> {
    let store = app.store(STORE_PATH).map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    let entries = store
        .get(HISTORY_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);

    Ok(entries)
}

#[tauri::command]
pub fn save_history_entry(app: tauri::AppHandle, entry: HistoryEntry) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    let mut entries: Vec<HistoryEntry> = store
        .get(HISTORY_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);

    // Remove existing entry with same id if present
    entries.retain(|e| e.id != entry.id);

    // Prepend new entry
    entries.insert(0, entry);

    // Trim to max
    entries.truncate(MAX_ENTRIES);

    store.set(HISTORY_KEY, serde_json::to_value(entries).unwrap());
    store.save().map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    Ok(())
}

#[tauri::command]
pub fn delete_history_entry(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    let mut entries: Vec<HistoryEntry> = store
        .get(HISTORY_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);

    entries.retain(|e| e.id != id);

    store.set(HISTORY_KEY, serde_json::to_value(entries).unwrap());
    store.save().map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    Ok(())
}

#[tauri::command]
pub fn update_history_nickname(
    app: tauri::AppHandle,
    id: String,
    nickname: String,
) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    let mut entries: Vec<HistoryEntry> = store
        .get(HISTORY_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);

    for entry in &mut entries {
        if entry.id == id {
            entry.nickname = if nickname.is_empty() {
                None
            } else {
                Some(nickname.clone())
            };
            break;
        }
    }

    store.set(HISTORY_KEY, serde_json::to_value(entries).unwrap());
    store.save().map_err(|e| {
        serde_json::to_string(&AppError::io(e.to_string())).unwrap()
    })?;

    Ok(())
}
