import * as React from 'react'

interface TabsContextValue {
    value: number
    setValue: (value: number) => void
}
const TabsContext = React.createContext<TabsContextValue>(null)

interface RootProps extends React.ComponentProps<'div'> {
    defaultValue: number
}
function Root(props: RootProps) {
    const [value, setValue] = React.useState(props.defaultValue)

    return(
        <TabsContext.Provider value={{value, setValue}}>
            <div {...props}>{props.children}</div>
        </TabsContext.Provider>
    )
}

interface ListProps extends React.ComponentProps<'div'> {
    dir: 'row' | 'column'
}
function List(props: ListProps) {
    const ctx = React.useContext(TabsContext)
    return <div style={{display: 'flex', flexDirection: props.dir, overflow: 'auto'}} {...props}>{props.children}</div>
}

export interface Props extends React.ComponentProps<'div'> {
    value: number
}
function Trigger(props: Props) {
    const ctx = React.useContext(TabsContext)
    const isActive = ctx.value == props.value

    return(
        <div role='button' value={props.value} data-state={isActive} onClick={() => ctx.setValue(props.value)} {...props}>
            {props.children}
        </div>
    )
}

function Content(props: Props) {
    const ctx = React.useContext(TabsContext)
    const isActive = ctx.value == props.value

    return(
        <div value={props.value} style={{display: isActive ? 'block' : 'none'}} {...props}>
            {props.children}
        </div>
    )
}

export { Root, List, Trigger, Content }