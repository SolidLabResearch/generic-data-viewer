import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";
import RightField from "./right-field/RightField";
import config from "./config.json" 
import { useState } from "react";

config = JSON.parse(JSON.stringify(config))


/**
 * 
 * @returns {Component} The root of the app.
 */
function App() {
  const [selectedquery, setSelectedquery] = useState(undefined)
  return (
    <div className="App">
      <h1 className="app-title">{config.title}</h1>
      <div className="app-body">
        <SelectionTable onSelected={(query) => setSelectedquery(query)} queries={config.queries}/>
        <RightField query={selectedquery} />
      </div>
      <footer><p><a href="https://idlab.technology/">IDLab</a> - <a href="https://www.imec.be/nl">imec</a> - <a href="https://www.ugent.be/">UGent</a></p></footer>

    </div>
  );
}



export default App;
