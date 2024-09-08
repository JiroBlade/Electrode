'use client'
import * as React from 'react'
import { createPortal } from 'react-dom'
import styles from './styles/styles.module.css'
import Image from 'next/image'

import { invoke } from '@tauri-apps/api/tauri'
import { CM, G, Tabs } from './modules/mod'
import { watch, RawEvent, RawEventKind } from './modules/watch'

type DiskEntry = { path: string, name: string, children?: DiskEntry[] }
type DiskEntryList = [string, DiskEntry[]]

export default function Page() {
    const [diskEntries, setDiskEntries] = React.useState<DiskEntryList>(['', []])
    const [dirEvent, setDirEvent] = React.useState<RawEvent[]>([])
    const [tabs, setTabs] = React.useState<DiskEntry[]>([])
    const offset = 200

    React.useEffect(() => {
        if(diskEntries != null) {
            watch(diskEntries[0], event => {
                const { type, paths } = event

                switch(true) {
                    case type.modify != undefined:
                        switch(type.modify.mode) {
                            case 'from':
                                
                            case 'to':
                        }
                }
            })
        }
    })

    function openFolder() {
        invoke<DiskEntryList>('open_folder')
            .then(res => {
                if(res != null) {
                    setDiskEntries(res)
                }
            })
            .catch(error => alert(error))
    }

    interface DiskEntryProps extends Tabs.Props {
        de: DiskEntry
    }
    function DiskEntry(props: DiskEntryProps) {
        const { de, value } = props
        const [flag, setFlag] = React.useState(false)
        const {toggle, CMRef, onCM} = CM.useContextMenu()
        const isFolder = de.children != null
        const diskentryRef = React.useRef<HTMLDivElement>()

        function DiskEntryCM() {
            return(
                <CM.Root ref={CMRef} pos={{x: toggle.x, y: toggle.y}} className={styles.contextmenu}>
                    <div role='button'>Delete</div>
                    <div role='button'>Rename</div>
                </CM.Root>
            )
        }

        return(
            <Tabs.Trigger value={value} title={de.path} className={styles['diskentry-box']}
            onContextMenu={onCM}
            onClick={() => {
                if(!isFolder && !tabs.includes({path: de.path, name: de.name})) {
                    setTabs([...tabs, {path: de.path, name: de.name}])
                }
            }}>
                <div ref={diskentryRef} className={styles.diskentry} onClick={() => setFlag(!flag)}>
                    {de.name}
                </div>
                {flag ? de.children?.map((v, i) => { return <DiskEntry key={i} de={v} value={i}/> } ) : <></>}
                {createPortal(toggle.flag && <DiskEntryCM/>, document.body)}
            </Tabs.Trigger>
        )
    }

    return(
        <>
            <div id={styles.menubar}>
                <G.Button onClick={openFolder}>Open Folder...</G.Button>
                <G.Button onClick={() => console.log(tabs)}>Test</G.Button>
                <G.Button onClick={() => alert('Electrode version: 0.1.0')}>About</G.Button>
            </div>
            <Tabs.Root defaultValue={0} id={styles.workspace}>
                <G.ResizablePanel initsize={offset} handle={1} id={styles.sidebar}>
                    <div role='label' title={diskEntries[0]}>{diskEntries[0].split('\\').pop()}</div>
                    <Tabs.List id={styles['diskentry-list']}>
                        {diskEntries[1].map((v, i) => <DiskEntry key={i} de={v} value={i}/>)}
                    </Tabs.List>
                </G.ResizablePanel>

                <G.ResizablePanel handle={0} id={styles.editor}>
                    <Tabs.List id={styles['tabs-list']}>
                        {tabs.map((v, i) => <Tabs.Trigger key={i} value={i} title={v.path} className={styles.tab}>{v.name}</Tabs.Trigger>)}
                    </Tabs.List>
                    <div style={{marginTop: '40px'}}>
                        {tabs.map((v, i) => <Tabs.Content key={i} value={i}>{i}</Tabs.Content>)}  
                    </div>
                </G.ResizablePanel>
            </Tabs.Root>
        </>
    )
}