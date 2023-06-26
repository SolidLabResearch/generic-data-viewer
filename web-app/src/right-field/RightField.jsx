import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

function RightField(){
    return(
        <div className="right-field">
            <div className="control-section">
                <button id="refresh-button">Refresh</button>
                <button id="login-button">Login</button>
            </div>
            <ResultsTable/>
        </div>
    )
}

export default RightField