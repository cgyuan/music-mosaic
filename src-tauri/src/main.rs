// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn plugin_log(message: String, window: tauri::Window) {
    println!("Plugin log: {}", message);
    // You can also emit an event to the frontend if needed
    window.emit("plugin-log", message).unwrap();
}

use tauri::command;
use serde_json::Value;
use url::Url;
use reqwest;
use std::fs::File;
use std::io::Write;
use std::collections::HashMap;
use std::process::Command;
use zip;
use urlencoding::decode;
use std::borrow::Cow;

#[command]
async fn http_request(method: String, url: String, headers: Option<Value>, body: Option<String>) -> Result<String, String> {
    let agent = ureq::agent();
    let parsed_url = Url::parse(&url).map_err(|e| e.to_string())?;
    
    let mut request = match method.to_lowercase().as_str() {
        "get" => agent.get(parsed_url.as_str()),
        "post" => agent.post(parsed_url.as_str()),
        "put" => agent.put(parsed_url.as_str()),
        "delete" => agent.delete(parsed_url.as_str()),
        _ => return Err("Unsupported HTTP method".to_string()),
    };

    // Add headers if provided
    if let Some(headers) = headers {
        if let Value::Object(header_map) = headers {
            for (key, value) in header_map {
                if let Value::String(value_str) = value {
                    request = request.set(&key, &value_str);
                }
            }
        }
    }

    // Send the request with or without a body
    let response = match body {
        Some(body_str) => request.send_string(&body_str),
        None => request.call(),
    }.map_err(|e| e.to_string())?;

    let body = response.into_string().map_err(|e| e.to_string())?;
    Ok(body)
}

// #[command]
// fn fetch_bilibili_data() -> Result<String, String> {
//     let agent = ureq::agent();
//     let response = agent
//         .get("https://api.bilibili.com/x/web-interface/popular/series/list")
//         .set("Content-Type", "application/json")
//         .set("accept", "*/*")
//         .set("accept-encoding", "gzip, deflate, br")
//         .set("accept-language", "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6")
//         .set("referer", "https://www.bilibili.com/")
//         .set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.63")
//         .call()
//         .map_err(|e| e.to_string())?;

//     let body = response.into_string().map_err(|e| e.to_string())?;
//     Ok(body)
// }

#[tauri::command]
async fn check_path_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

#[tauri::command]
async fn rmdir(path: String) -> Result<(), String> {
    std::fs::remove_dir_all(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    // check if file exists
    if !std::path::Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }
    std::fs::remove_file(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
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
            .map_err(|e| e.to_string())?;h
    }

    Ok(())
}

#[tauri::command]
async fn readdir(path: String, folder: Option<bool>) -> Result<Vec<String>, String> {
    let entries = std::fs::read_dir(&path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        
        // Skip if folder=true and entry is not a directory
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

#[tauri::command]
async fn download_file(url: String, file_path: String, headers: HashMap<String, String>) -> Result<(), String> {
    let client = reqwest::Client::new();
    let mut request = client.get(&url);
    
    // Add headers
    for (key, value) in headers {
        request = request.header(&key, value);
    }

    let response = request
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| e.to_string())?;

    let mut file = File::create(file_path)
        .map_err(|e| e.to_string())?;

    file.write_all(&bytes)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn unzip_file(file_path: String, output_dir: String) -> Result<(), String> {
    let file = File::open(&file_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = std::path::Path::new(&output_dir).join(file.mangled_name());

        if file.name().ends_with('/') {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    Ok(content)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![http_request, plugin_log, download_file, delete_file, open_folder, unzip_file, readdir, read_file, rmdir])
        .register_uri_scheme_protocol("theme", |_app, request| {
            let path = request.uri().strip_prefix("theme://localhost/").unwrap();
            // URL 解码路径
            let decoded_path = decode(path)
                .unwrap_or(Cow::Borrowed(path));
            let resource_path = std::path::PathBuf::from(decoded_path.as_ref());
            
            println!("Requested path: {:?}", path);
            println!("Decoded path: {:?}", decoded_path);
            println!("Resource path: {:?}", resource_path);
            println!("Path exists: {:?}", resource_path.exists());
            
            match std::fs::read(&resource_path) {
                Ok(content) => {
                    println!("Successfully read file with size: {} bytes", content.len());
                    tauri::http::ResponseBuilder::new()
                        .header("Content-Type", "image/*")
                        .body(content)
                },
                Err(e) => {
                    println!("Error reading file: {:?}", e);
                    tauri::http::ResponseBuilder::new()
                        .status(404)
                        .body(Vec::new())
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
