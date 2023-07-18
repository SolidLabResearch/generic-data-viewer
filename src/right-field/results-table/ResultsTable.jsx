import "./ResultsTable.css"

import config from "../../config.json"
import { useEffect, useRef, useState } from "react";
import { Grid, _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
import {typeRepresentationMapper, typeSortMapper} from '../../typeMapper.js'
import QueryWorker from "worker-loader!../../workers/worker"

config = JSON.parse(JSON.stringify(config))
if(!config.queryFolder){
  config.queryFolder = './'
}

if(config.queryFolder.substring(config.queryFolder.length-1) !== '/'){
  config.queryFolder = `${config.queryFolder}/`
}

let queryWorker = undefined

/**
 * 
 * @param {query} props.selectedQuery The query (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component giving a structural representation of the query results.  
 */
function ResultsTable(props){
    const selectedquery = props.selectedquery
    const [results, setResults] = useState([])
    const [variables, setVariables] = useState([])
    const containerRef = useRef()
    const [isQuerying, setQuerying] = useState(false)

    if(containerRef.current){
      containerRef.current.wrapper.current.className = "grid-wrapper";
    }  
    
    useEffect(() => {configureQueryWorker(adder, setVariables, setQuerying)}, [])
  
    let adder = adderFunctionMapper["bindings"](setResults)

    const onqueryChanged = () => {
      if(selectedquery){
        if(isQuerying){
          queryWorker.terminate()
          configureQueryWorker(adder, setVariables, setQuerying)
        }
        setResults([])
        setVariables([])
        setQuerying(true)
        executequery(selectedquery, queryWorker)
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
            <Grid style={{td: {"text-align": "center"}, th: {"text-align": "center"}, container: {"margin": "0"}}}
            className={{tbody: "grid-body"}}
            data={results} 
            sort={true}
            autowidth={false}
            fixedHeader={true}
            ref={containerRef}
            columns={variables.map(column => {return generateColumn(column, variables.length)})}/>
            }
        </div>
    )
}

const adderFunctionMapper = {
  "bindings": (setter) => {return (item, variable) => bindingStreamAdder(item, variable, setter)}
}

/**
 * Processes a result entry as it should look in the result table, and adds it to the table entries
 * @param {Object} item the entry which should be processed 
 * @param {Array<String>} variables A list of all the variables in the table 
 * @param {Function} setter function to set the table entries.
 */
function bindingStreamAdder(item, variables, setter){
  let newValues = []
  for(let variable of variables){
    let value = item[variable] ? item[variable] : ""
    let type = variable.split('_')[1]
    let componentCaller = typeRepresentationMapper[type] 
    componentCaller = componentCaller ? componentCaller : (text) => text.value
    newValues.push(componentCaller(value))
  }
  
  setter(old => {return [...old, newValues]})
}

/**
 * 
 * @param {Function} adder function which processes the result, takes the result as argument
 * @param {Function} variableSetter setter function for the variables, takes a list of variable names
 * @param {Function} setIsQuerying boolean setter function for whether the worker is still executing a query or not
 */
function configureQueryWorker(adder, variableSetter, setIsQuerying){
  queryWorker = new QueryWorker()
  let variablesMain = []
  queryWorker.onmessage = ({data}) => {
    switch (data.type){
      case 'result':
        let binding = JSON.parse(data.result)
        let entries = binding.entries 
        adder(entries, variablesMain)
          
        break; 
      case "end":
        setIsQuerying(false)
        break; 
      case "metadata": {
        variablesMain = data.metadata.variables.map(val => val.value)
        variableSetter(variablesMain)
        break; 
      }
    }
  }
}

/**
 * 
 * @param {String} variable a variable name 
 * @param {Integer} size total amount of variables
 * @returns {Object} a configuration object corresponding to a column, following GridJS config. 
 */
function generateColumn(variable, size){
  let variableSplitted = variable.split('_')
  return {
    name: variableSplitted[0],
    sort: {
      compare: typeSortMapper[variableSplitted[1]]
    },
    width: `${100/size}%`
  }
}

/**
 * A function that executes a given query and processes every result as a stream based on the functions provided. 
 * @param {query} query the query which gets executed 
 * @param {Worker} queryWorker the worker which will be used to execute the given query
*/
async function executequery(query, queryWorker){
  try{
    let result = await fetch(`${config.queryFolder}${query.queryLocation}`)
    query.queryText = await result.text()
    queryWorker.postMessage({selectedQuery: query})
  }
  catch(error){
    handlequeryFetchFail(error)
  }
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails. 
 */
function handlequeryFetchFail(error){
  console.error(error)
}


export default ResultsTable