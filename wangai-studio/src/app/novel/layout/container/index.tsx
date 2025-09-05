
import {LayoutProps} from "../types"
import styles from "./container.module.css" 
interface LayoutContainerProps  extends  LayoutProps{ 
    className?:string
    style?:React.CSSProperties
}

export function LayoutContainer({ children,className,style }:LayoutContainerProps){

    return (
        <div style={style} className={`${styles.container} ${className}`}>
            {children}
        </div>
    )

}