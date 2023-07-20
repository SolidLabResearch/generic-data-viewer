import "./ResultsTable.css"

import { useRef } from "react";
import { Grid, _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.min.css";
import { typeSortMapper } from '../../typeMapper.js'

/**
 * 
 * @param {query} props.selectedQuery The query (as defined in the config file) that should be executed and results displayed in the table. 
 * @returns {Component} A React component giving a structural representation of the query results.  
 */
function ResultsTable(props) {
  const selectedQuery = props.selectedQuery
  const results = props.results
  const variables = props.variables
  const containerRef = useRef()

  if (containerRef.current) {
    containerRef.current.wrapper.current.className = "grid-wrapper";
  }

  return (
    <div className="results-table">
      {!selectedQuery && <label>Please select a query.</label>}
      {selectedQuery &&
        <Grid style={{ td: { "text-align": "center" }, th: { "text-align": "center", "height": "fit-content" }, container: { "margin": "0" }, table: {"overflow": "hidden"} }}
          className={{ tbody: "grid-body" }}
          data={results}
          sort={true}
          autoWidth={!props.isQuerying}
          ref={containerRef}
          columns={variables.map(column => { return generateColumn(column, variables.length, props.isQuerying) })} />
      }
    </div>
  )
}

/**
 * Given a variable name and total amount of variables generates a configuration object as defined by GridJS https://gridjs.io/docs/config/columns 
 * @param {String} variable a variable name 
 * @param {Integer} size total amount of variables
 * @returns {Object} a configuration object corresponding to a column, following GridJS config. 
 */
function generateColumn(variable, size, isQuerying) {
  let variableSplitted = variable.split('_')
  let config = {
    name: variableSplitted[0],
    sort: {
      compare: typeSortMapper[variableSplitted[1]]
    }
  }
  return config
}



export default ResultsTable