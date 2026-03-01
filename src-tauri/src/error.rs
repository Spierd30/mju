use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppError {
    pub message: String,
    pub kind: String, // "parse_error" | "network_error" | "io_error"
    pub line: Option<u32>,
    pub column: Option<u32>,
}

impl AppError {
    pub fn parse(message: impl Into<String>, line: Option<u32>, column: Option<u32>) -> Self {
        AppError {
            message: message.into(),
            kind: "parse_error".to_string(),
            line,
            column,
        }
    }

    pub fn network(message: impl Into<String>) -> Self {
        AppError {
            message: message.into(),
            kind: "network_error".to_string(),
            line: None,
            column: None,
        }
    }

    pub fn io(message: impl Into<String>) -> Self {
        AppError {
            message: message.into(),
            kind: "io_error".to_string(),
            line: None,
            column: None,
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl From<AppError> for String {
    fn from(e: AppError) -> Self {
        serde_json::to_string(&e).unwrap_or_else(|_| e.message)
    }
}
