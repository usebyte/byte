use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn get_project_dir(app: &tauri::AppHandle, project_id: &str) -> PathBuf {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    let dir = app_dir.join("projects").join(project_id);
    dir
}

#[tauri::command]
fn save_project_file(
    app: tauri::AppHandle,
    project_id: String,
    file_name: String,
    file_data: Vec<u8>,
) -> Result<String, String> {
    let dir = get_project_dir(&app, &project_id);
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create directory: {}", e))?;
    let file_path = dir.join(&file_name);
    fs::write(&file_path, &file_data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn read_project_file(
    app: tauri::AppHandle,
    project_id: String,
    file_name: String,
) -> Result<Vec<u8>, String> {
    let dir = get_project_dir(&app, &project_id);
    let file_path = dir.join(&file_name);
    fs::read(&file_path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn delete_project_file(
    app: tauri::AppHandle,
    project_id: String,
    file_name: String,
) -> Result<(), String> {
    let dir = get_project_dir(&app, &project_id);
    let file_path = dir.join(&file_name);
    fs::remove_file(&file_path).map_err(|e| format!("Failed to delete file: {}", e))
}

#[tauri::command]
fn list_project_files(
    app: tauri::AppHandle,
    project_id: String,
) -> Result<Vec<String>, String> {
    let dir = get_project_dir(&app, &project_id);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut files = vec![];
    let entries = fs::read_dir(&dir).map_err(|e| format!("Failed to read directory: {}", e))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        if entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            if let Some(name) = entry.file_name().to_str() {
                files.push(name.to_string());
            }
        }
    }
    Ok(files)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(if cfg!(debug_assertions) {
                    log::LevelFilter::Debug
                } else {
                    log::LevelFilter::Info
                })
                .build(),
        )
        .setup(|_app| {
            log::info!("Byte app started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_project_file,
            read_project_file,
            delete_project_file,
            list_project_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
