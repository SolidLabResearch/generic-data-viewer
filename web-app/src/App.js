import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";
import RightField from "./right-field/RightField";
import config from "./config.json" 

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine()

config = JSON.parse(JSON.stringify(config))

if(!config.querry_folder){
  config.querry_folder = './'
}

if(config.querry_folder.substring(config.querry_folder.length-1) !== '/'){
  config.querry_folder = `${config.querry_folder}/`
}


function App() {
  return (
    <div className="App">
      <h1 className="app-title">{config.title}</h1>
      <div className="app-body">
        <SelectionTable onSelected={(querry) => executeQuerry(querry)} querries={config.querries}/>
        <RightField />
      </div>
      <footer><p><a href="https://idlab.technology/">IDLab</a> - <a href="https://www.imec.be/nl">imec</a> - <a href="https://www.ugent.be/">UGent</a></p></footer>

    </div>
  );
}

function executeQuerry(querry){
  fetch(`${config.querry_folder}${querry.querry_location}`).then(result => {
    result.text().then(q => {
      console.log(q)
      const execution = myEngine.queryBindings(
        q,
        {sources:querry.sources}
      )
      handleQuerryExecution(execution)
    })
    
  })
 
}

function handleQuerryExecution(execution){
  execution.then(bindingStream => {
    bindingStream.on('data', (binding) => {
      console.log(binding.toString())
    })
  }).catch(err => {
    console.error(err.message)
  })
}

export default App;
