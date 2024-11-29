// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod http;
mod filesystem;
mod compression;
mod tray;

use urlencoding::decode;
use std::borrow::Cow;

#[tauri::command]
fn plugin_log(message: String, window: tauri::Window) {
    println!("Plugin log: {}", message);
    window.emit("plugin-log", message).unwrap();
}

fn main() {
    tauri::Builder::default()
        .system_tray(tray::create_tray())
        .on_system_tray_event(tray::handle_tray_event)
        .invoke_handler(tauri::generate_handler![
            http::http_request,
            http::download_file,
            filesystem::check_path_exists,
            filesystem::rmdir,
            filesystem::delete_file,
            filesystem::open_folder,
            filesystem::readdir,
            filesystem::read_file,
            compression::unzip_file,
            plugin_log,
            tray::update_tray_state,
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
                    tauri::http::ResponseBuilder::new()
                        .header("Content-Type", content_type)
                        .body(content)
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
                event.window().hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
