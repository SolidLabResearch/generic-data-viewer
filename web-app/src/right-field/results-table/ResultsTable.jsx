import "./ResultsTable.css"

import config from "../../config.json"
import { useEffect, useState } from "react";
import { Grid } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
config = JSON.parse(JSON.stringify(config))

if(!config.querry_folder){
  config.querry_folder = './'
}

if(config.querry_folder.substring(config.querry_folder.length-1) !== '/'){
  config.querry_folder = `${config.querry_folder}/`
}

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine()

/**
 * 
 * @param {Querry} props.querry The querry (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component giving a structural representation of the querry results.  
 */

function ResultsTable(props){
    const selectedQuerry = props.selectedQuerry
    const [results, setResults] = useState([])
    const [variables, setVariables] = useState([])
    let adder = (item) => setResults((old) => {return [...old, item]})
    useEffect(() => {
        if(selectedQuerry){
            setResults([])
            executeQuerry(selectedQuerry, adder, setVariables)
        }
    }, [selectedQuerry])


    return(
        <div className="results-table">
            {!selectedQuerry && <label>Please select a querry.</label>}
            {selectedQuerry && 
            <Grid style={{td: {"text-align": "center"}, th: {"text-align": "center"}}} 
            data={results} 
            fixedHeader={true}
            height={"100%"}
            autoWidth="true" columns={variables}/>
            }
        </div>
    )
}

/**
 * A function that executes a given querry and processes every result as a stream based on the functions provided. 
 * @param {Querry} querry the querry which gets executed 
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
*/
function executeQuerry(querry, adder, variableSetter){
    return fetch(`${config.querry_folder}${querry.querry_location}`).then(result => {
      result.text().then(q => {
        const execution = myEngine.queryBindings(
          q,
          {sources:querry.sources}
        )
        handleQuerryExecution(execution, adder, variableSetter)
      })
      
    })
   
  }


/**
 * A function that given a BindingStream processes every result as a stream based on the functions provided. 
 * @param {Promise<BindingStream>} execution   
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
 */
function handleQuerryExecution(execution, adder, variableSetter){
  execution.then(bindingStream => {
    bindingStream.on('data', (binding) => {
      let triple = []
      let variables = []
      let keys = binding.keys()
      let key = keys.next()
      while(!key.done){
          triple.push(binding.get(key.value.value).id)
          variables.push(key.value.value)
          key = keys.next()
      }   
      variableSetter(variables)
      adder(triple)
    })
  }).catch(err => {
    console.error(err.message)
  })
}


export default ResultsTable; 