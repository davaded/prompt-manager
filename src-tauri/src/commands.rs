use tauri::State;
use uuid::Uuid;

use crate::db::Database;
use crate::models::{CreatePromptInput, Prompt, PromptHistory, UpdatePromptInput};

#[tauri::command]
pub async fn create_prompt(
    db: State<'_, Database>,
    input: CreatePromptInput,
) -> Result<Prompt, String> {
    let id = Uuid::new_v4().to_string();

    db.create_prompt(id, input.title, input.content, input.tags, input.variables)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_prompt(db: State<'_, Database>, id: String) -> Result<Option<Prompt>, String> {
    db.get_prompt(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_prompts(db: State<'_, Database>) -> Result<Vec<Prompt>, String> {
    db.list_prompts().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_prompt(
    db: State<'_, Database>,
    input: UpdatePromptInput,
) -> Result<Option<Prompt>, String> {
    db.update_prompt(
        &input.id,
        input.title,
        input.content,
        input.tags,
        input.variables,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_prompt(db: State<'_, Database>, id: String) -> Result<bool, String> {
    db.delete_prompt(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_prompts(db: State<'_, Database>, query: String) -> Result<Vec<Prompt>, String> {
    db.search_prompts(&query).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_prompt_history(
    db: State<'_, Database>,
    id: String,
) -> Result<Vec<PromptHistory>, String> {
    db.get_prompt_history(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn increment_usage(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.increment_usage(&id).await.map_err(|e| e.to_string())
}
