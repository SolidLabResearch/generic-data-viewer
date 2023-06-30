import "./SelectionTable.css"


/**
 * 
 * @param {Array<Querry>} props.querries all the querries which the user can choose from.  
 * @param {EventListener} props.onSelected event listeners that handles the event when a user selects a querry. 
 * @returns {Component} A table which gives a list of selectable options based on the querries provided. 
 */
function SelectionTable(props){
    const querries = props.querries
    const onSelected = props.onSelected
    return(
        <div className="selection-table">
            <h2 id="querries-title">Querries</h2>
            <div className="selection-table-box">
                <ul id="querry-list">
                    {querries.map((element, index) => (
                        <li key={index} onClick={() => onSelected(element)} className="querry-entry">
                            <h3>{element.name}</h3>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectionTable