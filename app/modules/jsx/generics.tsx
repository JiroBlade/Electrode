import * as React from 'react'

type Div = React.ComponentProps<'div'>

function Button(props: Div) {
    return <div role='button' {...props}>{props.children}</div>
}

interface ResizablePanelProps extends Div {
    initsize?: number
    handle: 0 | 1
}
function ResizablePanel(props: ResizablePanelProps) {
    const { initsize, handle } = props
    const [size, setSize] = React.useState(initsize)
    const [isResizing, setIsResizing] = React.useState(false)

    React.useEffect(() => {
        const handlemousemove = (e: MouseEvent) => {
            if(!isResizing) return
            const movement = e.movementX
            setSize(size + movement)
        }
        const handlemouseup = () => setIsResizing(false)

        document.addEventListener('mousemove', handlemousemove)
        document.addEventListener('mouseup', handlemouseup)
        return() => {
            document.removeEventListener('mousemove', handlemousemove)
            document.removeEventListener('mouseup', handlemouseup)
        }
    }, [size, isResizing])

    return(
        <div style={{width:`${size}px`}} {...props}>
            {props.children}
            {handle ? <ResizableHandle style={{marginLeft: `${size-2.5}px`, backgroundColor: isResizing ? '#0078D4' : ''}} onMouseDown={() => setIsResizing(true)}/> : <></>}
        </div>
    )
}

interface ResizableHandleProps extends Div {
    
}
const ResizableHandle = React.forwardRef((props: ResizableHandleProps, ref: React.Ref<HTMLDivElement>) => {
    return <div role='sash' ref={ref} {...props}/>
})

export { Button, ResizablePanel, ResizableHandle }

