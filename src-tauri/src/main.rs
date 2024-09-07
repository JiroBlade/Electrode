// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod watch;
use watch::{watch, unwatch, WatcherState};

use std::path::PathBuf;
use tauri::{api::{dialog::blocking::FileDialogBuilder, dir::{read_dir, DiskEntry}}, command, Window};

fn main() {
  tauri::Builder::default()
    .manage(WatcherState::default())
    .on_page_load(|window, payload| {
      window.show().unwrap()
    })
    .invoke_handler(tauri::generate_handler![watch, unwatch, open_folder])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[command]
async fn open_folder(window: Window) -> Option<(PathBuf, Vec<DiskEntry>)> {
  let filepath = FileDialogBuilder::new()
    .set_parent(&window)
    .pick_folder();

  match filepath {
    Some(path) => {
      Some((path.clone(), read_dir(path, true).unwrap()))
    },
    None => None
  }
}