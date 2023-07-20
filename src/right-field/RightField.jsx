import { useState, useEffect } from "react";
import ResultsTable from "./results-table/ResultsTable";
import "./RightField.css";
import { typeRepresentationMapper } from "../typeMapper.js";
import config from "../config.json";
import Time from "../components/Time";
import SolidLoginForm from "../components/SolidLoginForm";
import { fetch as authFetch, getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { QueryEngine } from "@comunica/query-sparql";

if (!config.queryFolder) {
  config.queryFolder = "./";
}

if (config.queryFolder.substring(config.queryFolder.length - 1) !== "/") {
  config.queryFolder = `${config.queryFolder}/`;
}

const myEngine = new QueryEngine();
let iterator = undefined;

/**
 *
 * @param {query} props.query The query (as defined in the config file) that should be executed and results displayed in the table.
 * @returns {Component} A React component that displays the given query in a table, with the functionality to refresh the results and to login for additional authorization.
 */
function RightField(props) {
  let selectedQuery = props.query;
  const [results, setResults] = useState([]);
  const [variables, setVariables] = useState([]);
  const [isQuerying, setQuerying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let intervalId;
    if (isQuerying) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [time, isQuerying]);

  let adder = adderFunctionMapper["bindings"](setResults);

  const onQueryChanged = () => {
    setTime(0);
    if (selectedQuery) {
      if (iterator) {
        disableIterator()
      }
      setResults([]);
      setVariables([]);
      iterator = undefined
      setQuerying(true);
      executeQuery(selectedQuery, setVariables, adder, setQuerying);
    }
  };

  useEffect(() => {
    onQueryChanged();
  }, [selectedQuery]);

  return (
    <div className="right-field">
      <div className="control-section">
        <button
          disabled={!selectedQuery}
          id="refresh-button"
          onClick={onQueryChanged}
        >
          Refresh
        </button>
        <div id="query-information">
          {selectedQuery && (
            <label>
              <strong>Result Count:</strong>
              {results.length}
            </label>
          )}
          {selectedQuery && (
            <strong id="query-name-label">{selectedQuery.name}</strong>
          )}
          {selectedQuery && (
            <label className="stopWatch">
              <strong>Runtime:</strong>
              <Time time={time} />
            </label>
          )}
        </div>
        <SolidLoginForm />
      </div>
      <ResultsTable
        results={results}
        variables={variables}
        selectedQuery={selectedQuery}
      />
    </div>
  );
}

const adderFunctionMapper = {
  bindings: (setter) => {
    return (item, variables) => bindingStreamAdder(item, variables, setter);
  },
};

/**
 * Processes a result entry as it should look in the result table, and adds it to the table entries
 * @param {Object} item the entry which should be processed
 * @param {Array<String>} variables A list of all the variables in the table
 * @param {Function} setter function to set the table entries.
 */
function bindingStreamAdder(item, variables, setter) {
  let newValues = [];
  for (let variable of variables) {
    let value = item.get(variable) ? item.get(variable) : "";
    let type = variable.split("_")[1];
    let componentCaller = typeRepresentationMapper[type];
    componentCaller = componentCaller ? componentCaller : (text) => text.id;
    newValues.push(componentCaller(value));
  }

  setter((old) => {
    return [...old, newValues];
  });
}

function disableIterator(){
  iterator.removeAllListeners('end')
  iterator.removeAllListeners('data')
  iterator.removeAllListeners('error')
  iterator.destroy()
}

/**
 * A function that executes a given query and processes every result as a stream based on the functions provided.
 * @param {query} query the query which gets executed
 * @param {Worker} queryWorker the worker which will be used to execute the given query
 */
async function executeQuery(query, variableSetter, resultAdder, setIsQuerying) {
  try {
    let result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    query.queryText = await result.text();
    let fetchFunction = getDefaultSession().info.isLoggedIn ? authFetch: fetch
    console.log(getDefaultSession().info.isLoggedIn)
    return handleQueryExecution(
      await myEngine.query(query.queryText, {
        sources: query.sources,
        fetch: fetchFunction,
      }),
      variableSetter, resultAdder, setIsQuerying
    );
  } catch (error) {
    setIsQuerying(false)
    handleQueryFetchFail(error);
  }
}

/**
 * A function that given a QueryType send every result as a stream to the main thread.
 * @param {Promise<QueryType>} execution the promise of a query execution
 */
async function handleQueryExecution(
  execution,
  variableSetter,
  resultAdder,
  setIsQuerying
) {
  try {
    let metadata = await execution.metadata();
    let variables = metadata.variables.map(val => {return val.value})
    variableSetter(variables);

    queryTypeHandlers[execution.resultType](
      await execution.execute(),
      variables,
      resultAdder,
      setIsQuerying
    );
  } catch (error) {
    console.error(error.message) //TODO
  }
}

const queryTypeHandlers = {
  bindings: configureBindingStream,
  quads: configureQuadStream,
  boolean: configureBool,
};

/**
 * Configures how a boolean query gets processed and sent to the main thread
 * @param {Boolean} result the result of a boolean query
 */
function configureBool(result) {
  postMessage({ type: "result", result: result });
  postMessage({ type: "end", message: "blank" });
}

/**
 *
 * @param {Function} adder function which processes the result, takes the result as argument
 * @param {Function} variableSetter setter function for the variables, takes a list of variable names
 * @param {Function} setIsQuerying boolean setter function for whether the worker is still executing a query or not
 */
function configureIterator(variables, resultAdder, setIsQuerying) {
  iterator.on("data", (data) => {
    resultAdder(data, variables);
  });

  iterator.on("end", () => {
    setIsQuerying(false);
  });
}

/**
 * Configures how a query resulting in a stream of quads should be processed and sent to the main thread
 * @param {AsyncIterator<Quad> & ResultStream<Quad>>} quadStream a stream of Quads
 */
function configureQuadStream(quadStream, variables, resultAdder, setIsQuerying) {
  iterator = quadStream;
  configureIterator(variables, resultAdder, setIsQuerying);
}

/**
 * Configures how a query resulting in a stream of bindings should be processed and sent to the main thread
 * @param {BindingStream} bindingStream a stream of  Bindings
 */
function configureBindingStream(bindingStream, variables, resultAdder, setIsQuerying) {
  iterator = bindingStream;
  configureIterator(variables, resultAdder, setIsQuerying);
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails.
 */
function handleQueryFetchFail(error) {
  console.error(error);
}

export default RightField;
