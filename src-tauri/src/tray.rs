use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, 
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    SystemTraySubmenu,
};
use tauri::SystemTrayMenuItemHandle;

#[tauri::command]
pub fn update_tray_state(app: tauri::AppHandle, play_state: bool, repeat_mode: &str, song_title: Option<String>, platform: Option<String>) {
    let tray_handle = app.tray_handle();
    
    // 更新播放/暂停状态
    tray_handle.get_item("play")
        .set_title(if play_state { "暂停" } else { "播放" })
        .unwrap();
    
    // 更新歌曲信息
    if let Some(title) = song_title {
        tray_handle.get_item("songInfo")
            .set_title(&title)
            .unwrap();
    }

    // 更新平台信息
    if let Some(platform_name) = platform {
        tray_handle.get_item("platform")
            .set_title(&format!("来源: {}", platform_name))
            .unwrap();
    }
    
    // 更新播放模式状态
    match repeat_mode {
        "single" => {
            tray_handle.get_item("singleLoop").set_selected(true).unwrap();
            tray_handle.get_item("listLoop").set_selected(false).unwrap();
            tray_handle.get_item("random").set_selected(false).unwrap();
        }
        "list" => {
            tray_handle.get_item("singleLoop").set_selected(false).unwrap();
            tray_handle.get_item("listLoop").set_selected(true).unwrap();
            tray_handle.get_item("random").set_selected(false).unwrap();
        }
        "random" => {
            tray_handle.get_item("singleLoop").set_selected(false).unwrap();
            tray_handle.get_item("listLoop").set_selected(false).unwrap();
            tray_handle.get_item("random").set_selected(true).unwrap();
        }
        _ => {}
    }
}

pub fn create_tray() -> SystemTray {
    // 创建播放控制菜单项
    let play = CustomMenuItem::new("play".to_string(), "播放");
    let prev = CustomMenuItem::new("prev".to_string(), "上一首");
    let next = CustomMenuItem::new("next".to_string(), "下一首");
    
    // 创建播放模式子菜单
    let single_loop = CustomMenuItem::new("singleLoop".to_string(), "单曲循环");
    let list_loop = CustomMenuItem::new("listLoop".to_string(), "列表循环")
        .selected(); // 默认选中
    let random = CustomMenuItem::new("random".to_string(), "随机播放");
    
    let play_mode_submenu = SystemTrayMenu::new()
        .add_item(single_loop)
        .add_item(list_loop)
        .add_item(random);
    
    // 创建歌词控制菜单项
    let desktop_lyric = CustomMenuItem::new("desktopLyric".to_string(), "开启桌面歌词");
    let lock_lyric = CustomMenuItem::new("lockLyric".to_string(), "锁定桌面歌词");
    
    // 创建设置和退出菜单项
    let settings = CustomMenuItem::new("settings".to_string(), "设置");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    // 组装菜单
    let tray_menu = SystemTrayMenu::new()
        // 显示当前播放的歌曲信息（作为禁用的菜单项显示）
        .add_item(CustomMenuItem::new("songInfo".to_string(), "未播放"))
        .add_item(CustomMenuItem::new("platform".to_string(), "来源: 未知").disabled())
        // 添加分隔线
        .add_native_item(SystemTrayMenuItem::Separator)
        // 添加播放控制
        .add_item(play)
        .add_item(prev)
        .add_item(next)
        .add_submenu(SystemTraySubmenu::new("播放模式", play_mode_submenu))
        // 添加分隔线
        .add_native_item(SystemTrayMenuItem::Separator)
        // 添加歌词控制
        .add_item(desktop_lyric.disabled())
        .add_item(lock_lyric.disabled())
        // 添加分隔线
        .add_native_item(SystemTrayMenuItem::Separator)
        // 添加设置和退出
        .add_item(settings)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            // if window.is_visible().unwrap() {
            //     window.hide().unwrap();
            // } else {
            //     window.show().unwrap();
            //     window.set_focus().unwrap();
            // }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let window = app.get_window("main").unwrap();
            
            match id.as_str() {
                "songInfo" => {
                    // 显示窗口并发送显示歌词视图的消息
                    window.show().unwrap();
                    window.set_focus().unwrap();
                    window.emit("show-lyric-view", ()).unwrap();
                }
                "quit" => {
                    app.exit(0);
                }
                "settings" => {
                    // 显示窗口并发送消息以打开设置页面
                    window.show().unwrap();
                    window.emit("open-settings", ()).unwrap();
                }
                "play" => {
                    // 发送播放/暂停消息到前端
                    window.emit("tray-playback-control", "toggle").unwrap();
                }
                "prev" => {
                    // 发送上一首消息到前端
                    window.emit("tray-playback-control", "prev").unwrap();
                }
                "next" => {
                    // 发送下一首消息到前端
                    window.emit("tray-playback-control", "next").unwrap();
                }
                "singleLoop" => {
                    window.emit("tray-playback-mode", "single").unwrap();
                    // 更新菜单项选中状态
                    app.tray_handle().get_item("singleLoop").set_selected(true).unwrap();
                    app.tray_handle().get_item("listLoop").set_selected(false).unwrap();
                    app.tray_handle().get_item("random").set_selected(false).unwrap();
                }
                "listLoop" => {
                    window.emit("tray-playback-mode", "list").unwrap();
                    app.tray_handle().get_item("singleLoop").set_selected(false).unwrap();
                    app.tray_handle().get_item("listLoop").set_selected(true).unwrap();
                    app.tray_handle().get_item("random").set_selected(false).unwrap();
                }
                "random" => {
                    window.emit("tray-playback-mode", "random").unwrap();
                    app.tray_handle().get_item("singleLoop").set_selected(false).unwrap();
                    app.tray_handle().get_item("listLoop").set_selected(false).unwrap();
                    app.tray_handle().get_item("random").set_selected(true).unwrap();
                }
                "desktopLyric" => {
                    // 发送切换桌面歌词消息到前端
                    window.emit("tray-lyric-control", "toggle").unwrap();
                }
                "lockLyric" => {
                    // 发送锁定桌面歌词消息到前端
                    window.emit("tray-lyric-control", "lock").unwrap();
                }
                _ => {}
            }
        }
        _ => {}
    }
} 