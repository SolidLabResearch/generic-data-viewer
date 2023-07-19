import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";
import RightField from "./right-field/RightField";
import config from "./config.json" 
import { useEffect, useState } from "react";
import { getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";

config = JSON.parse(JSON.stringify(config))


/**
 * 
 * @returns {Component} The root of the app.
 */
function App() {
  const [selectedQuery, setSelectedQuery] = useState(undefined)
  const session = getDefaultSession()
  const [loggedIn, setLoggedIn] = useState()
  useEffect(() => {
    session.onLogin(() => setLoggedIn(true))
    session.onLogout(() => setLoggedIn(false))

    handleIncomingRedirect({restorePreviousSession: true})
      .then((info) => {
        if(info){
          let status = info.isLoggedIn || false
          if(status !== loggedIn){
            setLoggedIn(status)
          }
        }
      })
  })
  return (
    <div className="App">
      <h1 className="app-title">{config.title}</h1>
      <div className="app-body">
        <SelectionTable onSelected={(query) => setSelectedQuery(query)} queries={config.queries}/>
        <RightField query={selectedQuery} />
      </div>
      <footer><p><a href="https://idlab.technology/">IDLab</a> - <a href="https://www.imec.be/nl">imec</a> - <a href="https://www.ugent.be/">UGent</a></p></footer>

    </div>
  );
}



export default App;
