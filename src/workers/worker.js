import { QueryEngine } from "@comunica/query-sparql"


let myEngine = new QueryEngine()

onmessage = (selectedQuery) => {
    executequery(selectedQuery.data.selectedQuery)
  }



/**
 * A function that executes a given query and processes every result as a stream based on the functions provided. 
 * @param {query} query the query which gets executed 
 * @param {Function} adder a function which handles what happens with every variable result  
 * @param {Function} variableSetter a function which handles what happens with every variable name 
*/
async function executequery(query){
    try{
      return handlequeryExecution(myEngine.query(
        query.queryText, {sources:query.sources}
  
      ))
    }
    catch(error){
      handlequeryFetchFail(error)
    }
  }
  
  
  /**
   * A function that given a BindingStream processes every result as a stream based on the functions provided. 
   * @param {BindingStream} execution   
   * @param {Function} adder a function which handles what happens with every variable result  
   * @param {Function} variableSetter a function which handles what happens with every variable name 
   */
  async function handlequeryExecution(execution){
    try{
      execution = await execution 
      let metadata = await execution.metadata()
      postMessage({type: 'metadata', metadata: {variables: metadata.variables, queryType: execution.resultType}})

      switch (execution.resultType){
        case "bindings": 
          configureBindingStream(await execution.execute())
          break; 
        
        case "quads": 
          configureQuadStream(await execution.execute())
          break
        case "boolean":
          postMessage({type: 'result', result : await execution.execute()})
          postMessage({type: 'end', message: "blank"})        
      }

    }
    catch(error){
      handleBindingStreamFail(error)
    }
     
  }

function configureStream(stream, dataParser = (data) => {return JSON.stringify(data)}){
  stream.on('data', (data) => {
    postMessage({type: 'result', result: dataParser(data)})
  })

  stream.on('error', (e) => {
      postMessage({type: "error", error: e})
  })

  stream.on('end', () => {
      postMessage({type: "end", message: "blank"})
  })
}

function configureQuadStream(quadStream){
    configureStream(quadStream)
}

function configureBindingStream(bindingStream){
    configureStream(bindingStream)
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