import { useState } from "react"


// Arrow
//https://stackoverflow.com/questions/30530946/collapse-arrow-on-mouse-click


/**
 * @param {EventListener} props.onClick an event listener for when the title in the component is clicked.
 * @param {String} props.extendContent the content shown when the component is extended.  
 * @returns A component with a title, which can be extended by clicking a button. If extended extra content is shown. 
 */
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