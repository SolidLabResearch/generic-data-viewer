import "./ResultsTable.css"

import config from "../../config.json"
import { useEffect, useState } from "react";
import { Grid } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
config = JSON.parse(JSON.stringify(config))

if(!config.queryFolder){
  config.queryFolder = './'
}

if(config.queryFolder.substring(config.queryFolder.length-1) !== '/'){
  config.queryFolder = `${config.queryFolder}/`
}

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine()

/**
 * 
 * @param {query} props.query The query (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component giving a structural representation of the query results.  
 */
function ResultsTable(props){
    const selectedquery = props.selectedquery
    const [results, setResults] = useState([])
    const [variables, setVariables] = useState([])
    let adder = (item) => setResults((old) => {return [...old, item]})
    let variableAdder = (newList) => setVariables((old) => [...new Set([...newList, ...old])])
    let onqueryChanged = () => {
      if(selectedquery){
        setResults([])
        executequery(selectedquery, adder, variableAdder)
      }
    }

    if(props.refreshButton.current){
      props.refreshButton.current.onclick = onqueryChanged
    }

    useEffect(() => {
        onqueryChanged()
    }, [selectedquery])

    return(
        <div className="results-table">
            {!selectedquery && <label>Please select a query.</label>}
            {selectedquery && 
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
 * A function that executes a given query and processes every result as a stream based on the functions provided. 
 * @param {query} query the query which gets executed 
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
*/
async function executequery(query, adder, variableSetter){
  try{
    let result = await fetch(`${config.queryFolder}${query.queryLocation}`)
    let queryText = await result.text()
    handlequeryExecution(myEngine.queryBindings(
      queryText, {sources:query.sources}

    ), adder, variableSetter)
  }
  catch(error){
    handlequeryFetchFail(error)
  }
}


/**
 * A function that given a BindingStream processes every result as a stream based on the functions provided. 
 * @param {Promise<BindingStream>} execution   
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
 */
async function handlequeryExecution(execution, adder, variableSetter){
  try{
    let bindingStream = await execution 
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

    bindingStream.on('error', handlequeryResultFail)
  }
  catch(error){
    handleBindingStreamFail(error)
  }
   
}

/**
 * Handles the event whenever an error occurs during query execution. 
 * @param {Error} error object returned by the communica engine whenever a problem occurs during query execution.
 */
function handlequeryResultFail(error){
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
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails. 
 */
function handlequeryFetchFail(error){
  console.error(error)
}


export default ResultsTable; 