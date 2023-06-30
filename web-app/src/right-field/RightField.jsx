import { useState } from "react"
import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

import config from "../config.json"

config = JSON.parse(JSON.stringify(config))


/**
 * 
 * @param {Querry} props.selectedQuerry the currently  
 * @returns 
 */
function RightField(props){
    let querry = props.querry 
    const [clicks, setClicks] = useState(0)
    return(
        <div className="right-field">
            <div className="control-section">
                <button onClick={() => setClicks((a) => {return a + 1})} disabled={querry===undefined} id="refresh-button">Refresh</button>
                {querry && <label id="querry-name-label">{querry.name}</label>}
                <button   id="login-button">Login</button>
            </div>
            <ResultsTable click={clicks} querry={querry}/>
        </div>
    )
}

export default RightField