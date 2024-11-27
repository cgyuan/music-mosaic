use serde_json::Value;
use url::Url;
use std::collections::HashMap;
use tauri::command;

#[command]
pub async fn http_request(method: String, url: String, headers: Option<Value>, body: Option<String>) -> Result<String, String> {
    let agent = ureq::agent();
    let parsed_url = Url::parse(&url).map_err(|e| e.to_string())?;
    
    let mut request = match method.to_lowercase().as_str() {
        "get" => agent.get(parsed_url.as_str()),
        "post" => agent.post(parsed_url.as_str()),
        "put" => agent.put(parsed_url.as_str()),
        "delete" => agent.delete(parsed_url.as_str()),
        _ => return Err("Unsupported HTTP method".to_string()),
    };

    if let Some(headers) = headers {
        if let Value::Object(header_map) = headers {
            for (key, value) in header_map {
                if let Value::String(value_str) = value {
                    request = request.set(&key, &value_str);
                }
            }
        }
    }

    let response = match body {
        Some(body_str) => request.send_string(&body_str),
        None => request.call(),
    }.map_err(|e| e.to_string())?;

    let body = response.into_string().map_err(|e| e.to_string())?;
    Ok(body)
}

#[command]
pub async fn download_file(url: String, file_path: String, headers: HashMap<String, String>) -> Result<(), String> {
    let client = reqwest::Client::new();
    let mut request = client.get(&url);
    
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

    let mut file = std::fs::File::create(file_path)
        .map_err(|e| e.to_string())?;

    std::io::Write::write_all(&mut file, &bytes)
        .map_err(|e| e.to_string())?;

    Ok(())
} 