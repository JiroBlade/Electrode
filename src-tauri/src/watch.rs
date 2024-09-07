use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::{collections::HashMap, path::PathBuf, sync::{mpsc::{channel, Receiver}, Mutex}, thread::spawn};
use tauri::{command, Runtime, State, Window};

type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Watch(#[from] notify::Error)
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> where S: serde::Serializer {
        serializer.serialize_str(&self.to_string())
    }
}

type WatchCollection = HashMap<u32, (RecommendedWatcher, PathBuf)>;

#[derive(Default)]
pub struct WatcherState(Mutex<WatchCollection>);

#[command]
pub async fn watch<R: Runtime>(
    window: Window<R>,
    state: State<'_, WatcherState>,
    id: u32,
    path: PathBuf) -> Result<()> {
    let (sx, rx) = channel();
    let mut watcher = RecommendedWatcher::new(sx, Config::default())?;

    watcher.watch(&path, RecursiveMode::Recursive)?;

    watch_raw(window, rx, id);

    state.0.lock().unwrap().insert(id, (watcher, path));

    Ok(())
}

#[command]
pub async fn unwatch(state: State<'_, WatcherState>, id: u32) -> Result<()> {
    if let Some((mut watcher, path)) = state.0.lock().unwrap().remove(&id) {
        watcher.unwatch(&path)?
    }

    Ok(())
}

fn watch_raw<R: Runtime>(window: Window<R>, rx: Receiver<notify::Result<Event>>, id: u32) {
    spawn(move || {
        let event_name = format!("watcher://raw-event/{id}");
        while let Ok(event) = rx.recv() {
            if let Ok(event) = event {
                window.emit(&event_name, event).unwrap();
            }
        }
    });
}