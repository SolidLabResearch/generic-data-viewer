import "./ResultsTable.css"

import config from "../../config.json"
import { useEffect, useState } from "react";
import { Grid } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
config = JSON.parse(JSON.stringify(config))

if(!config.querryFolder){
  config.querryFolder = './'
}

if(config.querryFolder.substring(config.querryFolder.length-1) !== '/'){
  config.querryFolder = `${config.querryFolder}/`
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
    let onQuerryChanged = () => {
      if(selectedQuerry){
        setResults([])
        executeQuerry(selectedQuerry, adder, setVariables)
      }
    }

    if(props.refreshButton.current){
      props.refreshButton.current.onclick = onQuerryChanged
    }

    useEffect(() => {
        onQuerryChanged()
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
    return fetch(`${config.querryFolder}${querry.querryLocation}`).then(result => {
      result.text().then(q => {
        const execution = myEngine.queryBindings(
          q,
          {sources:querry.sources}
        )
        handleQuerryExecution(execution, adder, variableSetter)
      })
    }).catch(handleQuerryFetchFail)
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

    bindingStream.on('error', handleQuerryResultFail)
  }).catch(handleBindingStreamFail)
}

/**
 * Handles the event whenever an error occurs during querry execution. 
 * @param {Error} error object returned by the communica engine whenever a problem occurs during query execution.
 */
function handleQuerryResultFail(error){
  console.error(error)
}

/**
 * Handles the event whenever the creation of a BindingStream fails. 
 * @param {Error} error error object returned by the communica engine whenever the creation of a BindingStream fails.  
 */
function handleBindingStreamFail(error){
  console.error(error)
}

/**
 * Handles the event whenever the fetching of a querry fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails. 
 */
function handleQuerryFetchFail(error){
  console.error(error)
}


export default ResultsTable; 