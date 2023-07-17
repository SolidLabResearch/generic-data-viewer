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
      return handlequeryExecution(myEngine.queryBindings(
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
      let bindingStream = await execution 
      configureBindingStream(bindingStream)

      return bindingStream
    }
    catch(error){
      handleBindingStreamFail(error)
    }
     
  }

function configureBindingStream(bindingStream){
    bindingStream.on('data', (data) => {
        postMessage({type: 'result', result: JSON.stringify(data)})
    })

    bindingStream.on('error', (e) => {
        postMessage({type: "error", error: e})
    })

    bindingStream.on('end', () => {
        postMessage({type: "end", message: "blank"})
    })
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