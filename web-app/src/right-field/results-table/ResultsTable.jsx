import "./ResultsTable.css"

import config from "../../config.json"
import { useEffect, useRef, useState } from "react";
import { Grid } from "gridjs-react";

config = JSON.parse(JSON.stringify(config))

if(!config.querry_folder){
  config.querry_folder = './'
}

if(config.querry_folder.substring(config.querry_folder.length-1) !== '/'){
  config.querry_folder = `${config.querry_folder}/`
}

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine()

function ResultsTable(props){
    const selectedQuerry = props.selectedQuerry
    const [results, setResults] = useState([])
    const wrapperRef = useRef(undefined)
    let adder = (item) => setResults((old) => {return [...old, item]})

    useEffect(() => {
        const grid = new Grid()
    }).render(wrapperRef.current)

    useEffect(() => {
        if(selectedQuerry){
            setResults([])
            executeQuerry(selectedQuerry, adder)
        }
    }, [selectedQuerry])


    return(
        <div className="results-table">
            {!selectedQuerry && <label>Please select a querry.</label>}
            <div ref={wrapperRef}></div>
        </div>
    )
}

function executeQuerry(querry, adder){
    console.log(`${config.querry_folder}${querry.querry_location}`)
    return fetch(`${config.querry_folder}${querry.querry_location}`).then(result => {
      result.text().then(q => {
        console.log(q)
        const execution = myEngine.queryBindings(
          q,
          {sources:querry.sources}
        )
        handleQuerryExecution(execution, adder)
      })
      
    })
   
  }
  
  function handleQuerryExecution(execution, adder){
    execution.then(bindingStream => {
      bindingStream.on('data', (binding) => {
        console.log(binding.toString())
        adder(binding.toString())
      })
    }).catch(err => {
      console.error(err.message)
    })
  }


export default ResultsTable; 