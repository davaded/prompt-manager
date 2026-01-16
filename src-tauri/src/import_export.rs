use tauri::command;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub exported_at: i64,
    pub prompts: Vec<crate::models::Prompt>,
}

#[command]
pub async fn export_data(
    db: tauri::State<'_, crate::db::Database>,
    file_path: String,
) -> Result<(), String> {
    // Get all prompts
    let prompts = db.list_prompts().await.map_err(|e| e.to_string())?;

    let export_data = ExportData {
        version: "1.0.0".to_string(),
        exported_at: chrono::Utc::now().timestamp(),
        prompts,
    };

    // Write to file
    let json = serde_json::to_string_pretty(&export_data).map_err(|e| e.to_string())?;
    fs::write(&file_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn import_data(
    db: tauri::State<'_, crate::db::Database>,
    file_path: String,
) -> Result<usize, String> {
    // Read file
    let json = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let import_data: ExportData = serde_json::from_str(&json).map_err(|e| e.to_string())?;

    let mut imported_count = 0;

    // Import prompts
    for prompt in import_data.prompts {
        match db
            .create_prompt(
                uuid::Uuid::new_v4().to_string(), // Generate new ID
                prompt.title,
                prompt.content,
                prompt.tags,
                prompt.variables,
            )
            .await
        {
            Ok(_) => imported_count += 1,
            Err(e) => eprintln!("Failed to import prompt: {}", e),
        }
    }

    Ok(imported_count)
}
