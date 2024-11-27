// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod http;
mod filesystem;
mod compression;

use urlencoding::decode;
use std::borrow::Cow;

#[tauri::command]
fn plugin_log(message: String, window: tauri::Window) {
    println!("Plugin log: {}", message);
    window.emit("plugin-log", message).unwrap();
}

fn main() {
    tauri::Builder::default()
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
        ])
        .register_uri_scheme_protocol("theme", |_app, request| {
            let path = request.uri().strip_prefix("theme://localhost/").unwrap();
            let decoded_path = decode(path)
                .unwrap_or(Cow::Borrowed(path));
            let resource_path = std::path::PathBuf::from(decoded_path.as_ref());
            
            match std::fs::read(&resource_path) {
                Ok(content) => {
                    tauri::http::ResponseBuilder::new()
                        .header("Content-Type", "image/*")
                        .body(content)
                },
                Err(_) => {
                    tauri::http::ResponseBuilder::new()
                        .status(404)
                        .body(Vec::new())
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
