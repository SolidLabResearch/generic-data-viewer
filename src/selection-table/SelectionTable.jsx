import "./SelectionTable.css"


/**
 * 
 * @param {Array<query>} props.queries all the queries which the user can choose from.  
 * @param {EventListener} props.onSelected event listeners that handles the event when a user selects a query. 
 * @returns {Component} A table which gives a list of selectable options based on the queries provided. 
 */
function SelectionTable(props){
    const queries = props.queries
    const onSelected = props.onSelected
    return(
        <div className="selection-table">
            <h2 id="queries-title">queries</h2>
            <div className="selection-table-box">
                <ul id="query-list">
                    {queries.map((element, index) => (
                        <li key={index} onClick={() => onSelected(element)} className="query-entry">
                            <h3>{element.name}</h3>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectionTable