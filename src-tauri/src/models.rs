use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub variables: Vec<PromptVariable>,
    pub meta: PromptMeta,
    pub history: Option<Vec<PromptHistory>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptMeta {
    pub created_at: i64,
    pub updated_at: i64,
    pub usage_count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptVariable {
    pub key: String,
    #[serde(rename = "type")]
    pub var_type: String,
    pub options: Option<Vec<String>>,
    pub default: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptHistory {
    pub version_id: String,
    pub timestamp: i64,
    pub content: String,
    pub diff_summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePromptInput {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub variables: Vec<PromptVariable>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePromptInput {
    pub id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
    pub variables: Option<Vec<PromptVariable>>,
}
