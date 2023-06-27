import { useState } from "react"


// Arrow
//https://stackoverflow.com/questions/30530946/collapse-arrow-on-mouse-click

function ExtendableSelector({onClick, extendContent, children}){
    const [extended, setExtended] = useState(false)
    let switchExtended = () => setExtended((old) => {return !old})
    return(
        <>
            <li onClick={onClick} className="querry-entry">
                <div className="extend-container">
                     {children}
                     <div onClick={(e) => {switchExtended(); e.target.classList.toggle('down')}} className="arrow"/>
                </div>
                <p className="extended-content">{extended && extendContent}</p>

            </li>
        </>
    )
}


export default ExtendableSelector