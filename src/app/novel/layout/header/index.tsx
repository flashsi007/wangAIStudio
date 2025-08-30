
import styles from "./header.module.css"

import {LayoutProps} from "../types"

export  function Header({ children }: LayoutProps){

     return (<div className= {`${styles.header} `}>
        {children}
      </div>)

}