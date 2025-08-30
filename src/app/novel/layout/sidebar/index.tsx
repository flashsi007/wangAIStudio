
import { useMemo, ComponentProps } from "react";
import {LayoutProps}  from "../types"
import styles from "./sidebar.module.css"


interface SidebarProps extends   LayoutProps {
    width:number | string;
    props?:ComponentProps<'div'> 
    className?:string;
    style?:React.CSSProperties;
}
export  function Sidebar({ children,width='5rem',className ,props,style}:SidebarProps){ 


  const sidebarWidth = useMemo(()=>{ 

      if(typeof width === 'number' && width !=100){
            return `${width}rem`
        }

        // @ts-ignore
        if( typeof width === 'number' &&   width === 100){  
             // @ts-ignore
          return `${parseFloat(width)}%` 
        }
        
        else{
            return `${parseFloat(width)}%`
        }

  },[width]);


    return (

     <div 
     style={{ width:sidebarWidth,...(style || {}) }}
     {...props}
     className={`${styles.sidebarAnimated} ${styles.sidebar} ${className}`}>
        {children}
     </div>
    )
}