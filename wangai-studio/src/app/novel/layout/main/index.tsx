import styles from "./main.module.css"
import React,{ ComponentProps } from 'react'
import {LayoutProps} from "../types"


interface MainProps extends  LayoutProps {
   props?:ComponentProps<'div'>
   style:React.CSSProperties
}



export  function Main({ children,props,style }: MainProps){

    return (
        <div   style={style}   className={`${styles.main} flex-1`}  >   
            {children}
        </div>
    )
}