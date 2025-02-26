// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod http;
mod filesystem;
mod compression;
mod tray;

use urlencoding::decode;
use std::borrow::Cow;
use tauri::Manager;

#[tauri::command]
fn plugin_log(message: String, window: tauri::Window) {
    println!("Plugin log: {}", message);
    window.emit("plugin-log", message).unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                println!("target_os = \"{}\"", std::env::consts::OS);
                if let Some(window) = app.get_window("main") {
                    window.set_decorations(false).unwrap();
                }
            }
            Ok(())
        })
        .system_tray(tray::create_tray())
        .on_system_tray_event(tray::handle_tray_event)
        .invoke_handler(tauri::generate_handler![
            http::http_request,
            http::download_file,
            tray::update_tray_lyric_state,
            tray::update_tray_lyric_lock_state,
            filesystem::check_path_exists,
            filesystem::rmdir,
            filesystem::delete_file,
            filesystem::open_folder,
            filesystem::readdir,
            filesystem::read_file,
            filesystem::copy_file,
            compression::unzip_file,
            plugin_log,
            tray::update_tray_state
        ])
        .register_uri_scheme_protocol("theme", |_app, request| {
            let path = request.uri().strip_prefix("theme://localhost/").unwrap();
            let decoded_path = decode(path)
                .unwrap_or(Cow::Borrowed(path));
            let resource_path = std::path::PathBuf::from(decoded_path.as_ref());
            
            let content_type = match resource_path.extension()
                .and_then(|ext| ext.to_str()) {
                Some("js") => "application/javascript",
                Some("css") => "text/css",
                Some("html") => "text/html",
                Some("png") => "image/png",
                Some("jpg") | Some("jpeg") => "image/jpeg",
                Some("gif") => "image/gif",
                Some("svg") => "image/svg+xml",
                Some("mp4") => "video/mp4",
                Some("webm") => "video/webm",
                Some("mp3") => "audio/mpeg",
                Some("wav") => "audio/wav",
                Some("json") => "application/json",
                Some("woff") => "font/woff",
                Some("woff2") => "font/woff2",
                Some("ttf") => "font/ttf",
                _ => "application/octet-stream",
            };
            
            match std::fs::read(&resource_path) {
                Ok(content) => {
                    let response_builder = tauri::http::ResponseBuilder::new()
                        .header("Content-Type", content_type)
                        .header("Accept-Ranges", "bytes");

                    // 处理 Range 请求
                    if let Some(range_header) = request.headers().get("Range") {
                        if let Ok(range_str) = range_header.to_str() {
                            if let Some(range) = parse_range(range_str, content.len()) {
                                let (start, end) = range;
                                let content_length = end - start + 1;
                                let content_range = format!("bytes {}-{}/{}", start, end, content.len());
                                
                                return response_builder
                                    .status(206)
                                    .header("Content-Range", content_range)
                                    .header("Content-Length", content_length.to_string())
                                    .body(content[start..=end].to_vec())
                            }
                        }
                    }

                    // 如果没有 Range 请求或解析失败，返回完整内容
                    response_builder.body(content)
                },
                Err(_) => {
                    tauri::http::ResponseBuilder::new()
                        .status(404)
                        .body(Vec::new())
                }
            }
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                let window = event.window();
                window.emit("window-close-requested", ()).unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 添加这个辅助函数来解析 Range 头
fn parse_range(range: &str, content_length: usize) -> Option<(usize, usize)> {
    // 期望格式: "bytes=start-end" 或 "bytes=start-"
    let bytes_prefix = "bytes=";
    if !range.starts_with(bytes_prefix) {
        return None;
    }

    let range_str = &range[bytes_prefix.len()..];
    let parts: Vec<&str> = range_str.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<usize>().ok()?;
    let end = if parts[1].is_empty() {
        content_length - 1
    } else {
        parts[1].parse::<usize>().ok()?
    };

    if start <= end && end < content_length {
        Some((start, end))
    } else {
        None
    }
}
