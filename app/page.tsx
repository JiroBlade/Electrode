'use client'
import * as React from 'react'
import { createPortal } from 'react-dom'
import styles from './styles/styles.module.css'
import Image from 'next/image'

import { invoke } from '@tauri-apps/api/tauri'
import { useContextMenu, ContextMenu } from './modules/contextmenu'
import * as Tabs from './modules/tabs'
import { watch, RawEvent, RawEventKind } from './modules/watch'

type DiskEntry = { path: string, name: string, children?: DiskEntry[] }
type DiskEntryList = [string, DiskEntry[]]

export default function Page() {
    const [diskEntries, setDiskEntries] = React.useState<DiskEntryList>(['', []])
    const [dirEvent, setDirEvent] = React.useState<RawEvent[]>([])
    const [tabs, setTabs] = React.useState<DiskEntry[]>([])

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
        invoke<DiskEntryList>('open_folder').then(res => {
            if(res != null) {
                setDiskEntries(res)
            }
        })
    }

    interface DiskEntryProps extends Tabs.Props {
        de: DiskEntry
    }
    function DiskEntry(props: DiskEntryProps) {
        const { de, value } = props
        const [flag, setFlag] = React.useState(false)
        const {toggle, CMRef, onCM} = useContextMenu()
        const isFolder = de.children != null

        function DiskEntryCM() {
            return(
                <ContextMenu ref={CMRef} pos={{x: toggle.x, y: toggle.y}} className={styles.contextmenu}>
                    <div role='button'>Delete</div>
                    <div role='button'>Rename</div>
                </ContextMenu>
            )
        }

        function DiskEntryName() {
            return(
                <div className={styles.diskentry} onClick={() => setFlag(!flag)}>
                    <Image src={isFolder ? '/folder.png': 'file.png'} width={18} height={18} alt=''/> {de.name}
                </div>
            )
        }

        return(
            <Tabs.Trigger value={value} title={de.path} className={styles['diskentry-box']}
            onContextMenu={onCM}
            onClick={e => {
                if(!isFolder && !tabs.includes({path: e.currentTarget.getAttribute('title'), name: e.currentTarget.textContent})) {
                    setTabs([...tabs, {path: e.currentTarget.getAttribute('title'), name: e.currentTarget.textContent}])
                }
            }}>
                <DiskEntryName/>
                {flag ? de.children?.map((v, i) => { return <DiskEntry key={i} de={v} value={i}/> } ) : <></>}
                {createPortal(toggle.flag && <DiskEntryCM/>, document.body)}
            </Tabs.Trigger>
        )
    }

    return(
        <>
            <div id={styles.menubar}>
                <div role='button' onClick={openFolder}>Open Folder...</div>
                <div role='button' onClick={() => console.log(tabs)}>Test</div>
                <div role='button' onClick={() => alert('Electrode version: 0.1.0')}>About</div>
            </div>
            <Tabs.Root defaultValue={0} style={{marginTop: '25px'}}>
                <Tabs.List dir='column' id={styles.sidebar}>
                    {diskEntries[1].map((v, i) => <DiskEntry key={i} de={v} value={i}/>)}
                </Tabs.List>
                <div style={{marginLeft: '250px'}}>
                    <Tabs.List dir='row'>
                        {tabs.map((v, i) => <Tabs.Trigger key={i} value={i} title={v.path} className={styles.tab}>{v.name}</Tabs.Trigger>)}
                    </Tabs.List>
                    {tabs.map((v, i) => <Tabs.Content key={i} value={i}>{i}</Tabs.Content>)}
                </div>
            </Tabs.Root>
        </>
    )
}