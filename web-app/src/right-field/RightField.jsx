import { useCallback, useState } from "react"
import ResultsTable from "./results-table/ResultsTable"
import "./RightField.css"

function RightField(props){
    console.log(props.selectedQuerry)
    let selectedQuerry = props.selectedQuerry 
    const [clicks, setClicks] = useState(0)
    return(
        <div className="right-field">
            <div className="control-section">
                <button onClick={() => setClicks((a) => {return a + 1})} disabled={selectedQuerry===undefined} id="refresh-button">Refresh</button>
                <button   id="login-button">Login</button>
            </div>
            <ResultsTable click={clicks} selectedQuerry={selectedQuerry}/>
        </div>
    )
}

export default RightField