import "./SelectionTable.css"

function SelectionTable(props){
    const querries = props.querries
    const onClick = props.onClick
    return(
        <div className="selection-table">
            <h2 id="querries-title">Querries</h2>
            <div className="selection-table-box">
                <ul id="querry-list">
                    {querries.map(element => (
                        <li className="querry-entry">
                            <h3 onClick={onClick}>{element.name}</h3>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectionTable