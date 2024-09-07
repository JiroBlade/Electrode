import { invoke } from "@tauri-apps/api/tauri";
import { UnlistenFn } from "@tauri-apps/api/event";

export type RawEvent = {
    type: RawEventKind,
    paths: string[],
    attrs?: unknown
}

export type RawEventKind = {
    access?,
    create?,
    modify?: { kind: string, mode: string },
    remove?
}

async function unwatch(id: number): Promise<void> {
    await invoke('unwatch', { id })
}

export async function watch(
    path: string,
    cb: (event: RawEvent) => void
): Promise<UnlistenFn> {

    const id = window.crypto.getRandomValues(new Uint32Array(1))[0]

    await invoke('watch', { id, path: path })

    const { appWindow } = await import("@tauri-apps/api/window");
    const unlisten = await appWindow.listen<RawEvent>(
        `watcher://raw-event/${id}`, event => {
        cb(event.payload)
    })

    return() => {
        void unwatch(id)
        unlisten()
    }
}