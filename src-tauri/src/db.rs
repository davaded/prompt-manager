use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use sqlx::Row;
use std::path::PathBuf;

use crate::models::{Prompt, PromptHistory, PromptMeta, PromptVariable};

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(db_path: PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
        // Ensure the database directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Use sqlite:// protocol with absolute path
        let db_url = format!("sqlite://{}?mode=rwc", db_path.display());

        println!("Connecting to database: {}", db_url);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await?;

        // Run migrations
        Self::run_migrations(&pool).await?;

        Ok(Database { pool })
    }

    async fn run_migrations(pool: &SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
        let migration_sql = include_str!("../migrations/001_init.sql");
        sqlx::query(migration_sql).execute(pool).await?;
        Ok(())
    }

    pub async fn create_prompt(
        &self,
        id: String,
        title: String,
        content: String,
        tags: Vec<String>,
        variables: Vec<PromptVariable>,
    ) -> Result<Prompt, Box<dyn std::error::Error>> {
        let now = chrono::Utc::now().timestamp();

        // Insert prompt
        sqlx::query(
            "INSERT INTO prompts (id, title, content, created_at, updated_at, usage_count)
             VALUES (?, ?, ?, ?, ?, 0)",
        )
        .bind(&id)
        .bind(&title)
        .bind(&content)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Insert tags
        for tag in &tags {
            self.ensure_tag_exists(tag).await?;
            let tag_id = self.get_tag_id(tag).await?;
            sqlx::query("INSERT INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)")
                .bind(&id)
                .bind(tag_id)
                .execute(&self.pool)
                .await?;
        }

        // Insert variables
        for var in &variables {
            sqlx::query(
                "INSERT INTO prompt_variables (prompt_id, key, var_type, options, default_value)
                 VALUES (?, ?, ?, ?, ?)",
            )
            .bind(&id)
            .bind(&var.key)
            .bind(&var.var_type)
            .bind(serde_json::to_string(&var.options)?)
            .bind(&var.default)
            .execute(&self.pool)
            .await?;
        }

        // Create initial history entry
        let version_id = format!("v1");
        sqlx::query(
            "INSERT INTO prompt_history (prompt_id, version_id, content, timestamp)
             VALUES (?, ?, ?, ?)",
        )
        .bind(&id)
        .bind(&version_id)
        .bind(&content)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(Prompt {
            id,
            title,
            content,
            tags,
            variables,
            meta: PromptMeta {
                created_at: now,
                updated_at: now,
                usage_count: 0,
            },
            history: None,
        })
    }

    pub async fn get_prompt(&self, id: &str) -> Result<Option<Prompt>, Box<dyn std::error::Error>> {
        let row = sqlx::query("SELECT * FROM prompts WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => {
                let prompt_id: String = row.get("id");
                let tags = self.get_prompt_tags(&prompt_id).await?;
                let variables = self.get_prompt_variables(&prompt_id).await?;

                Ok(Some(Prompt {
                    id: prompt_id,
                    title: row.get("title"),
                    content: row.get("content"),
                    tags,
                    variables,
                    meta: PromptMeta {
                        created_at: row.get("created_at"),
                        updated_at: row.get("updated_at"),
                        usage_count: row.get("usage_count"),
                    },
                    history: None,
                }))
            }
            None => Ok(None),
        }
    }

    pub async fn list_prompts(&self) -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
        let rows = sqlx::query("SELECT * FROM prompts ORDER BY updated_at DESC")
            .fetch_all(&self.pool)
            .await?;

        let mut prompts = Vec::new();
        for row in rows {
            let prompt_id: String = row.get("id");
            let tags = self.get_prompt_tags(&prompt_id).await?;
            let variables = self.get_prompt_variables(&prompt_id).await?;

            prompts.push(Prompt {
                id: prompt_id,
                title: row.get("title"),
                content: row.get("content"),
                tags,
                variables,
                meta: PromptMeta {
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                    usage_count: row.get("usage_count"),
                },
                history: None,
            });
        }

        Ok(prompts)
    }

    pub async fn update_prompt(
        &self,
        id: &str,
        title: Option<String>,
        content: Option<String>,
        tags: Option<Vec<String>>,
        variables: Option<Vec<PromptVariable>>,
    ) -> Result<Option<Prompt>, Box<dyn std::error::Error>> {
        let now = chrono::Utc::now().timestamp();

        // Get current prompt for history
        let current = self.get_prompt(id).await?;
        if current.is_none() {
            return Ok(None);
        }
        let current = current.unwrap();

        // Update basic fields
        if let Some(ref new_title) = title {
            sqlx::query("UPDATE prompts SET title = ?, updated_at = ? WHERE id = ?")
                .bind(new_title)
                .bind(now)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        if let Some(ref new_content) = content {
            // Save to history if content changed
            if &current.content != new_content {
                let history_count: i64 = sqlx::query("SELECT COUNT(*) as count FROM prompt_history WHERE prompt_id = ?")
                    .bind(id)
                    .fetch_one(&self.pool)
                    .await?
                    .get("count");

                let version_id = format!("v{}", history_count + 1);
                sqlx::query(
                    "INSERT INTO prompt_history (prompt_id, version_id, content, timestamp)
                     VALUES (?, ?, ?, ?)",
                )
                .bind(id)
                .bind(&version_id)
                .bind(new_content)
                .bind(now)
                .execute(&self.pool)
                .await?;
            }

            sqlx::query("UPDATE prompts SET content = ?, updated_at = ? WHERE id = ?")
                .bind(new_content)
                .bind(now)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        // Update tags
        if let Some(ref new_tags) = tags {
            sqlx::query("DELETE FROM prompt_tags WHERE prompt_id = ?")
                .bind(id)
                .execute(&self.pool)
                .await?;

            for tag in new_tags {
                self.ensure_tag_exists(tag).await?;
                let tag_id = self.get_tag_id(tag).await?;
                sqlx::query("INSERT INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)")
                    .bind(id)
                    .bind(tag_id)
                    .execute(&self.pool)
                    .await?;
            }
        }

        // Update variables
        if let Some(ref new_vars) = variables {
            sqlx::query("DELETE FROM prompt_variables WHERE prompt_id = ?")
                .bind(id)
                .execute(&self.pool)
                .await?;

            for var in new_vars {
                sqlx::query(
                    "INSERT INTO prompt_variables (prompt_id, key, var_type, options, default_value)
                     VALUES (?, ?, ?, ?, ?)",
                )
                .bind(id)
                .bind(&var.key)
                .bind(&var.var_type)
                .bind(serde_json::to_string(&var.options)?)
                .bind(&var.default)
                .execute(&self.pool)
                .await?;
            }
        }

        self.get_prompt(id).await
    }

    pub async fn delete_prompt(&self, id: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let result = sqlx::query("DELETE FROM prompts WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn search_prompts(&self, query: &str) -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
        let search_pattern = format!("%{}%", query);
        let rows = sqlx::query(
            "SELECT DISTINCT p.* FROM prompts p
             LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
             LEFT JOIN tags t ON pt.tag_id = t.id
             WHERE p.title LIKE ? OR p.content LIKE ? OR t.name LIKE ?
             ORDER BY p.updated_at DESC"
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&self.pool)
        .await?;

        let mut prompts = Vec::new();
        for row in rows {
            let prompt_id: String = row.get("id");
            let tags = self.get_prompt_tags(&prompt_id).await?;
            let variables = self.get_prompt_variables(&prompt_id).await?;

            prompts.push(Prompt {
                id: prompt_id,
                title: row.get("title"),
                content: row.get("content"),
                tags,
                variables,
                meta: PromptMeta {
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                    usage_count: row.get("usage_count"),
                },
                history: None,
            });
        }

        Ok(prompts)
    }

    pub async fn get_prompt_history(&self, id: &str) -> Result<Vec<PromptHistory>, Box<dyn std::error::Error>> {
        let rows = sqlx::query(
            "SELECT version_id, content, diff_summary, timestamp
             FROM prompt_history WHERE prompt_id = ? ORDER BY timestamp DESC"
        )
        .bind(id)
        .fetch_all(&self.pool)
        .await?;

        let mut history = Vec::new();
        for row in rows {
            history.push(PromptHistory {
                version_id: row.get("version_id"),
                timestamp: row.get("timestamp"),
                content: row.get("content"),
                diff_summary: row.get("diff_summary"),
            });
        }

        Ok(history)
    }

    pub async fn increment_usage(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query("UPDATE prompts SET usage_count = usage_count + 1 WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // Helper methods
    async fn ensure_tag_exists(&self, tag: &str) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query("INSERT OR IGNORE INTO tags (name) VALUES (?)")
            .bind(tag)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn get_tag_id(&self, tag: &str) -> Result<i64, Box<dyn std::error::Error>> {
        let row = sqlx::query("SELECT id FROM tags WHERE name = ?")
            .bind(tag)
            .fetch_one(&self.pool)
            .await?;
        Ok(row.get("id"))
    }

    async fn get_prompt_tags(&self, prompt_id: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let rows = sqlx::query(
            "SELECT t.name FROM tags t
             INNER JOIN prompt_tags pt ON t.id = pt.tag_id
             WHERE pt.prompt_id = ?"
        )
        .bind(prompt_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(|row| row.get("name")).collect())
    }

    async fn get_prompt_variables(&self, prompt_id: &str) -> Result<Vec<PromptVariable>, Box<dyn std::error::Error>> {
        let rows = sqlx::query("SELECT * FROM prompt_variables WHERE prompt_id = ?")
            .bind(prompt_id)
            .fetch_all(&self.pool)
            .await?;

        let mut variables = Vec::new();
        for row in rows {
            let options_str: Option<String> = row.get("options");
            let options = if let Some(s) = options_str {
                serde_json::from_str(&s).ok()
            } else {
                None
            };

            variables.push(PromptVariable {
                key: row.get("key"),
                var_type: row.get("var_type"),
                options,
                default: row.get("default_value"),
            });
        }

        Ok(variables)
    }
}
