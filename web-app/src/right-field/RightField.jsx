import { useState } from "react"
import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

import config from "../config.json"

config = JSON.parse(JSON.stringify(config))

function RightField(props){
    let selectedQuerry = props.selectedQuerry 
    const [clicks, setClicks] = useState(0)
    return(
        <div className="right-field">
            <div className="control-section">
                <button onClick={() => setClicks((a) => {return a + 1})} disabled={selectedQuerry===undefined} id="refresh-button">Refresh</button>
                {selectedQuerry && <label id="querry-name-label">{selectedQuerry.name}</label>}
                <button   id="login-button">Login</button>
            </div>
            <ResultsTable click={clicks} selectedQuerry={selectedQuerry}/>
        </div>
    )
}

export default RightField