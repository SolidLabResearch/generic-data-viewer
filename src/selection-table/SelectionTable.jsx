import "./SelectionTable.css"
import ExtendableSelector from "../../src/components/ExtendableSelector"

function SelectionTable(props){
    const queries = props.queries
    const onSelected = props.onSelected
    return(
        <div className="selection-table">
            <h2 id="queries-title">Queries</h2>
            <div className="selection-table-box">
                <ul id="query-list">
                    {queries.map((element, index) => (
                        <ExtendableSelector extendContent={element.description} key={index} className="query-entry">
                            <button className="query-selector" onClick={() => onSelected(element)}>{element.name}</button>
                        </ExtendableSelector>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectionTable