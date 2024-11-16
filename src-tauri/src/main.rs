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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![http_request, plugin_log, download_file, delete_file, open_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
