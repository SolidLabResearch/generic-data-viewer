import { useRef } from "react"
import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"
import config from "../config.json"

/**
 * 
 * @param {query} props.query The query (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component that displays the given query in a table, with the functionality to refresh the results and to login for additional authorization.  
 */
function RightField(props){
    let query = props.query
    let refreshRef = useRef(undefined) 
    return(
        <div className="right-field" style={{backgroundColor: config.mainAppColor}}>
            <div className="control-section">
                <button ref={refreshRef}  disabled={query===undefined} id="refresh-button">Refresh</button>
                {query && <label id="query-name-label">{query.name}</label>}
                <button id="login-button">Login</button>
            </div>
            <ResultsTable refreshButton={refreshRef}  selectedQuery={query}/>
        </div>
    )
}

export default RightField