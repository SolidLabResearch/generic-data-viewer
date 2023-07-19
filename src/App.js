import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";
import RightField from "./right-field/RightField";
import config from "./config.json" 
import {  useState } from "react";


/**
 * 
 * @returns {Component} The root of the app.
 */
function App() {
  const [selectedQuery, setSelectedQuery] = useState(undefined)
  return (
    <div className="App" style={{backgroundColor: config.backgroundColor}}>
      <header>
        <img className="logo" src={config.logoLocation}></img>
        <h1 className="app-title">{config.title}</h1>
      </header>
      <div className="app-body">
        <SelectionTable onSelected={(query) => setSelectedQuery(query)} queries={config.queries}/>
        <RightField query={selectedQuery} />
      </div>
      <footer dangerouslySetInnerHTML={{__html: config.footer}}></footer>

    </div>
  );
}



export default App;
