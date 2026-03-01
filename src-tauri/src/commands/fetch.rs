use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Header {
    pub key: String,
    pub value: String,
}

#[tauri::command]
pub fn fetch_url(url: String, headers: Vec<Header>) -> Result<String, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| {
            serde_json::to_string(&AppError::network(e.to_string())).unwrap()
        })?;

    let mut req = client.get(&url);
    for h in &headers {
        if !h.key.is_empty() {
            req = req.header(&h.key, &h.value);
        }
    }

    let resp = req.send().map_err(|e| {
        serde_json::to_string(&AppError::network(format!("Request failed: {}", e))).unwrap()
    })?;

    let status = resp.status();
    if !status.is_success() {
        let err = AppError::network(format!("HTTP {} {}", status.as_u16(), status.canonical_reason().unwrap_or("")));
        return Err(serde_json::to_string(&err).unwrap());
    }

    resp.text().map_err(|e| {
        serde_json::to_string(&AppError::network(format!("Failed to read response: {}", e))).unwrap()
    })
}
