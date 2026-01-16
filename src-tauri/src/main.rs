// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;
mod import_export;

use std::path::PathBuf;
use db::Database;
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Initialize database
            let app_handle = app.handle();

            // Use a local path for development
            let app_dir = if cfg!(dev) {
                // Development: use local directory
                std::env::current_dir()
                    .unwrap_or_else(|_| PathBuf::from("."))
                    .join("data")
            } else {
                // Production: use app data directory
                app_handle
                    .path()
                    .app_data_dir()
                    .expect("Failed to get app data directory")
            };

            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
            let db_path = app_dir.join("prompt-manager.db");

            println!("Database path: {:?}", db_path);

            // Initialize database in blocking context
            let database = tauri::async_runtime::block_on(async {
                Database::new(db_path)
                    .await
                    .expect("Failed to initialize database")
            });

            app.manage(database);

            // Get the main window
            let window = app.get_webview_window("main").unwrap();

            // Register global shortcut: Ctrl+Shift+P (or Cmd+Shift+P on macOS)
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyP);

            let window_clone = window.clone();

            // Try to register shortcut handler and shortcut, but don't fail if it's already registered
            match app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if window_clone.is_visible().unwrap_or(false) {
                        let _ = window_clone.hide();
                    } else {
                        let _ = window_clone.show();
                        let _ = window_clone.set_focus();
                    }
                }
            }) {
                Ok(_) => {
                    match app.global_shortcut().register(shortcut) {
                        Ok(_) => println!("Global shortcut registered: Ctrl+Shift+P"),
                        Err(e) => println!("Warning: Failed to register global shortcut: {}. The app will still work without it.", e),
                    }
                },
                Err(e) => {
                    println!("Warning: Failed to setup global shortcut handler: {}. The app will still work without it.", e);
                }
            }

            // Show window on first launch
            window.show().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_prompt,
            commands::get_prompt,
            commands::list_prompts,
            commands::update_prompt,
            commands::delete_prompt,
            commands::search_prompts,
            commands::get_prompt_history,
            commands::increment_usage,
            import_export::export_data,
            import_export::import_data,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, event| {
            if let tauri::RunEvent::WindowEvent {
                label: _,
                event: WindowEvent::CloseRequested { api, .. },
                ..
            } = event
            {
                // Prevent window from closing, hide instead
                api.prevent_close();
            }
        });
}
