import "./SelectionTable.css"
import ExtendableSelector from "../components/ExtendableSelector"

function SelectionTable(props){
    const querries = props.querries
    const onSelected = props.onSelected
    return(
        <div className="selection-table">
            <h2 id="querries-title">Querries</h2>
            <div className="selection-table-box">
                <ul id="querry-list">
                    {querries.map((element, index) => (
                        <ExtendableSelector extendContent={element.description} key={index} className="querry-entry">
                            <h3 onClick={() => onSelected(element)}>{element.name}</h3>
                        </ExtendableSelector>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectionTable