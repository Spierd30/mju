mod commands;
mod error;

use commands::{
    fetch::fetch_url,
    files::{open_file, save_file},
    history::{delete_history_entry, get_history, save_history_entry, update_history_nickname},
    json::parse_json,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            parse_json,
            fetch_url,
            open_file,
            save_file,
            get_history,
            save_history_entry,
            delete_history_entry,
            update_history_nickname,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
