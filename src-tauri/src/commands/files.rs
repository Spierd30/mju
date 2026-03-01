use crate::error::AppError;
use serde::{Deserialize, Serialize};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tokio::sync::oneshot;

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenFileResult {
    pub path: String,
    pub content: String,
}

#[tauri::command]
pub async fn open_file(app: tauri::AppHandle) -> Result<OpenFileResult, String> {
    let (tx, rx) = oneshot::channel::<Option<FilePath>>();

    app.dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .pick_file(move |path| {
            let _ = tx.send(path);
        });

    let file = rx.await.map_err(|_| "Dialog closed unexpectedly".to_string())?;

    match file {
        Some(path) => {
            let path_str = path.to_string();
            let content = std::fs::read_to_string(&path_str).map_err(|e| {
                serde_json::to_string(&AppError::io(format!("Failed to read file: {}", e))).unwrap()
            })?;
            Ok(OpenFileResult {
                path: path_str,
                content,
            })
        }
        None => Err(serde_json::to_string(&AppError::io("No file selected")).unwrap()),
    }
}

#[tauri::command]
pub async fn save_file(
    app: tauri::AppHandle,
    content: String,
    suggested_path: Option<String>,
) -> Result<String, String> {
    let (tx, rx) = oneshot::channel::<Option<FilePath>>();

    let mut dialog = app.dialog().file().add_filter("JSON Files", &["json"]);

    if let Some(ref suggested) = suggested_path {
        if let Some(name) = std::path::Path::new(suggested).file_name() {
            dialog = dialog.set_file_name(name.to_string_lossy().as_ref());
        }
    }

    dialog.save_file(move |path| {
        let _ = tx.send(path);
    });

    let path = rx.await.map_err(|_| "Dialog closed unexpectedly".to_string())?;

    match path {
        Some(p) => {
            let path_str = p.to_string();
            std::fs::write(&path_str, content).map_err(|e| {
                serde_json::to_string(&AppError::io(format!("Failed to write file: {}", e)))
                    .unwrap()
            })?;
            Ok(path_str)
        }
        None => Err(serde_json::to_string(&AppError::io("Save cancelled")).unwrap()),
    }
}
