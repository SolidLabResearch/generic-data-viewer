import "./ResultsTable.css"

import { useEffect, useState } from "react";
import { Grid, _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
import {typeRepresentationMapper, typeSortMapper} from '../../typeMapper.js'
import QueryWorker from "worker-loader!../../workers/worker"

import config from "../../config.json"

config = JSON.parse(JSON.stringify(config))
if(!config.queryFolder){
  config.queryFolder = './'
}

if(config.queryFolder.substring(config.queryFolder.length-1) !== '/'){
  config.queryFolder = `${config.queryFolder}/`
}


/**
 * 
 * @param {query} props.query The query undefined(as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component giving a structural representation of the query results.  
 */
function ResultsTable(props){
    const selectedquery = props.selectedquery
    const [results, setResults] = useState([])
    const [variables, setVariables] = useState([])
    const [isQuerying, setQuerying] = useState(false)
    const [queryWorker, setQueryWorker] = useState(undefined) 


    let adder = (item, variables) => setResults((old) => {
      let newValues = []
      for(let variable of variables){
        let value = item[variable] ? item[variable] : ""
        let type = variable.split('_')[1]
        let componentCaller = typeRepresentationMapper[type] 
        componentCaller = componentCaller ? componentCaller : (text) => text.value
        newValues.push(componentCaller(value))
      }
      
      return [...old, newValues]}
      
    )
    
    useEffect(() => {configureQueryWorker(setQueryWorker, adder, setVariables, setQuerying)}, [])

    let onqueryChanged = () => {
      
      if(selectedquery){
        if(isQuerying){
          queryWorker.terminate()
          configureQueryWorker(setQueryWorker, adder, setVariables, setQuerying)
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
            <Grid style={{td: {"text-align": "center"}, th: {"text-align": "center"}}} 
            data={results} 
            fixedHeader={true}
            height={"100%"}
            autoWidth="false" 
            sort={true}
            columns={variables.map(column => {return generateColumn(column)})}/>
            }
        </div>
    )
}

function configureQueryWorker(workerSetter, adder, variableSetter, setIsQuerying){
  let queryWorker = new QueryWorker()
  workerSetter(queryWorker)
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


function generateColumn(variable){
  let variableSplitted = variable.split('_')
  return {
    name: variableSplitted[0],
    sort: {
      compare: typeSortMapper[variableSplitted[1]]
    }
  }
}

/**
 * A function that executes a given query and processes every result as a stream based on the functions provided. 
 * @param {query} query the query which gets executed 
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
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


export default ResultsTable; 