import * as React from 'react'

function useContextMenu() {
    const [toggle, setToggle] = React.useState({flag: false, x: 0, y: 0})
    const CMRef = React.useRef<HTMLDivElement>()

    React.useEffect(() => {
        window.addEventListener('keydown', e => {
            if(e.key == 'Escape') {
                setToggle({flag: false, x: 0, y: 0})
            }
        })

        window.addEventListener('mousedown', e => {
            if(CMRef.current && !CMRef.current.contains(e.target as Node)) {
                setToggle({flag: false, x: 0, y: 0})
            }
        })
    })

    function onCM(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        setToggle({flag: true, x: e.clientX, y: e.clientY})
    }

    return {toggle, CMRef, onCM}
}

interface ContextMenuProps extends React.ComponentProps<'div'> {
    pos: {x: number, y: number}
}
const ContextMenu = React.forwardRef((props: ContextMenuProps, ref: React.Ref<HTMLDivElement>) => {
    return(
        <div role='backdrop'>
            <div role='contextmenu-box' ref={ref} style={{left: props.pos.x, top: props.pos.y}}>
                <div {...props}>
                    {props.children}
                </div>
            </div>
        </div>
    )
})

export { useContextMenu, ContextMenu }