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

    // In this function we don't use await because inside a React Effect it causes linting warnings and according to several sources on the Web it is not recommended.
    // https://ultimatecourses.com/blog/using-async-await-inside-react-use-effect-hook
    // https://www.thisdot.co/blog/async-code-in-useeffect-is-dangerous-how-do-we-deal-with-it/
    handleIncomingRedirect({restorePreviousSession: true})
      .then((info) => {
        if(info){
          let status = info.isLoggedIn
          if(status !== loggedIn){
            setLoggedIn(status)
          }
        }
      })
  })
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
