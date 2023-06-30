import { useState } from "react"
import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

/**
 * 
 * @param {Querry} props.querry The querry (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component that displays the given Querry in a table, with the functionality to refresh the results and to login for additional authorization.  
 */
function RightField(props){
    let querry = props.querry 
    const [clicks, setClicks] = useState(0)
    console.log(clicks)
    return(
        <div className="right-field">
            <div className="control-section">
                <button onClick={() => setClicks((a) => {return a+1})} disabled={querry===undefined} id="refresh-button">Refresh</button>
                {querry && <label id="querry-name-label">{querry.name}</label>}
                <button   id="login-button">Login</button>
            </div>
            <ResultsTable click={clicks} selectedQuerry={querry}/>
        </div>
    )
}

export default RightField