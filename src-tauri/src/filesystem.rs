use std::process::Command;
use tauri::command;

#[command]
pub async fn check_path_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

#[command]
pub async fn rmdir(path: String) -> Result<(), String> {
    std::fs::remove_dir_all(path)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn delete_file(path: String) -> Result<(), String> {
    if !std::path::Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }
    std::fs::remove_file(path)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[command]
pub async fn readdir(path: String, folder: Option<bool>) -> Result<Vec<String>, String> {
    let entries = std::fs::read_dir(&path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        
        if folder.unwrap_or(false) && !entry.file_type().map_err(|e| e.to_string())?.is_dir() {
            continue;
        }
        
        let name = entry.file_name();
        if let Some(name_str) = name.to_str() {
            files.push(name_str.to_string());
        }
    }
    
    Ok(files)
}

#[command]
pub async fn read_file(file_path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    Ok(content)
} 