import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

function RightField(props){
    const selectedQuerry = props.selectedQuerry 
    return(
        <div className="right-field">
            <div className="control-section">
                <button disabled={selectedQuerry===undefined} id="refresh-button">Refresh</button>
                <button id="login-button">Login</button>
            </div>
            <ResultsTable selectedQuerry={selectedQuerry}/>
        </div>
    )
}

export default RightField