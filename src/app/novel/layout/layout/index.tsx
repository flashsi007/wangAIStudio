
import styles from "./layout.module.css"

import {LayoutProps} from "../types"

export function Layout ({ children }: LayoutProps){
    return (
        <div className={styles.layout} >
          {children}
        </div>
    )
}