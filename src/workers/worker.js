import { QueryEngine } from "@comunica/query-sparql"


let myEngine = new QueryEngine()

onmessage = (selectedQuery) => {
  executeQuery(selectedQuery.data.selectedQuery)
}

/**
 * A function that executes a given query and processes every result as a stream based on the functions provided. 
 * @param {query} query the query which gets executed 
*/
async function executeQuery(query) {
  try {
    return handleQueryExecution(myEngine.query(
      query.queryText, { sources: query.sources }

    ))
  }
  catch (error) {
    handleQueryFetchFail(error)
  }
}

const queryTypeHandlers = {
  "bindings": configureBindingStream,
  "quads": configureQuadStream,
  "boolean": configureBool
}

/**
 * A function that given a QueryType send every result as a stream to the main thread. 
 * @param {Promise<QueryType>} execution the promise of a query execution 
 */
async function handleQueryExecution(execution) {
  try {
    execution = await execution
    let metadata = await execution.metadata()
    postMessage({ type: 'metadata', metadata: { variables: metadata.variables, queryType: execution.resultType } })

    queryTypeHandlers[execution.resultType](await execution.execute())

  }
  catch (error) {
    handleBindingStreamFail(error)
  }
}

/**
 * Configures how a boolean query gets processed and sendt to the main thread
 * @param {Boolean} result the result of a boolean query 
 */
function configureBool(result) {
  postMessage({ type: 'result', result: result })
  postMessage({ type: "end", message: "blank" })
}

/**
 * Configures how a query resulting in a stream of quads or bindings should be processed and sent to the main thread
 * @param {BindingStream || (AsyncIterator<Quad> & ResultStream<Quad>>)} stream 
 * @param {Function} dataParser Parses the values from the stream seperately as they should be sent to main thread  
 */
function configureStream(stream, dataParser = (data) => { return JSON.stringify(data) }) {
  stream.on('data', (data) => {
    postMessage({ type: 'result', result: dataParser(data) })
  })

  stream.on('error', (e) => {
    postMessage({ type: "error", error: e })
  })

  stream.on('end', () => {
    postMessage({ type: "end", message: "blank" })
  })
}

/**
 * Configures how a query resulting in a stream of quads should be processed and sent to the main thread
 * @param {AsyncIterator<Quad> & ResultStream<Quad>>} quadStream a stream of Quads  
 */
function configureQuadStream(quadStream) {
  configureStream(quadStream)
}

/**
 * Configures how a query resulting in a stream of bindings should be processed and sent to the main thread
 * @param {BindingStream} bindingStream a stream of  Bindings 
 */
function configureBindingStream(bindingStream) {
  configureStream(bindingStream)
}


/**
 * Handles the event whenever the creation of a BindingStream fails. 
 * @param {Error} error error object returned by the communica engine whenever the creation of a BindingStream fails.  
 */
function handleBindingStreamFail(error) {
  console.error(error)
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails. 
 */
function handleQueryFetchFail(error) {
  console.error(error)
}