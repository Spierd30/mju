use crate::error::AppError;
use serde_json::Value;

#[tauri::command]
pub fn parse_json(raw: String) -> Result<Value, String> {
    serde_json::from_str::<Value>(&raw).map_err(|e| {
        let msg = e.to_string();
        // serde_json errors include "line X column Y" in their Display
        let (line, column) = extract_line_col(&msg);
        let err = AppError::parse(clean_message(&msg), line, column);
        serde_json::to_string(&err).unwrap_or(msg)
    })
}

fn extract_line_col(msg: &str) -> (Option<u32>, Option<u32>) {
    // serde_json format: "... at line X column Y"
    let mut line = None;
    let mut col = None;
    if let Some(at) = msg.find(" at line ") {
        let rest = &msg[at + 9..];
        let parts: Vec<&str> = rest.splitn(3, ' ').collect();
        if parts.len() >= 3 && parts[1] == "column" {
            line = parts[0].parse().ok();
            col = parts[2].parse().ok();
        }
    }
    (line, col)
}

fn clean_message(msg: &str) -> String {
    // Remove trailing " at line X column Y" to avoid duplication
    if let Some(at) = msg.find(" at line ") {
        msg[..at].to_string()
    } else {
        msg.to_string()
    }
}
