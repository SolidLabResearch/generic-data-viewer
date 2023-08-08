import { useState, useEffect, useCallback } from "react";
import ResultsTable from "./results-table/ResultsTable";
import "./RightField.css";
import { typeRepresentationMapper } from "../typeMapper.js";
import config from "../config.json";
import Time from "../components/Time";
import SolidLoginForm from "../components/SolidLoginForm";
import {
  fetch as authFetch,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import { QueryEngine } from "@comunica/query-sparql";
import { ProxyHandlerStatic } from "@comunica/actor-http-proxy";

const EventEmitter = require("events");

if (!config.queryFolder) {
  config.queryFolder = "./";
}

if (config.queryFolder.substring(config.queryFolder.length - 1) !== "/") {
  config.queryFolder = `${config.queryFolder}/`;
}

const myEngine = new QueryEngine();
let proxyHandler = undefined;
if(config.httpProxy){
  proxyHandler = new ProxyHandlerStatic(config.httpProxy);
}
let iterator = undefined;

/**
 *
 * @param {query} props.query The query (as defined in the config file) that should be executed and results displayed in the table.
 * @returns {Component} A React component that displays the given query in a table, with the functionality to refresh the results and to login for additional authorization.
 */
function RightField(props) {
  const selectedQuery = props.query;
  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState(undefined);
  const [variables, setVariables] = useState([]);
  const [isQuerying, setQuerying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let intervalId;
    if (isQuerying) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [time, isQuerying]);

  /**
   * starts the execution of a query and adjusts the UI respectively.
   */
  const startQueryExecution = useCallback(() => {
    setTime(0);
    if (selectedQuery) {
      const eventEmitter = makeUIEventEmitter(
        setVariables,
        setResultType,
        setQuerying,
        setErrorMessage
      );
      setErrorMessage(undefined);
      disableIterator();
      setResults([]);
      setVariables([]);
      iterator = undefined;
      setQuerying(true);
      executeQuery(selectedQuery, eventEmitter, setResults);
    }
  }, [selectedQuery]);

  useEffect(() => {
    startQueryExecution();
  }, [selectedQuery, startQueryExecution]);

  return (
    <div
      className="right-field"
      style={{ backgroundColor: config.mainAppColor }}
    >
      <div className="control-section">
        <div className="refresh-button-container">
          <button
            disabled={!selectedQuery}
            id="refresh-button"
            onClick={startQueryExecution}
          >
            Refresh
          </button>
        </div>

        <div id="query-information">
          {selectedQuery && (
            <strong id="query-name-label">{selectedQuery.name}</strong>
          )}
          {(selectedQuery && resultType !== "boolean") && (
            <div className="information-box">
              <label>
                <strong>Result Count:</strong>
                {results.length}
              </label>
            </div>
          )}
          {selectedQuery && (
            <div className="information-box stopWatch">
              <label>
                {isQuerying && <strong>Runtime:</strong>}
                {!isQuerying && <strong>Finished in:</strong>}
                <Time time={time} showMilliseconds={config.showMilliseconds} />
              </label>
            </div>
          )}
        </div>
        <SolidLoginForm
          defaultIDP={config.defaultIDP}
          onClick={disableIterator}
        />
      </div>
      {errorMessage && <label className="error-label">{errorMessage}</label>}
      {!errorMessage && (
        <ResultsTable
          resultType={resultType}
          results={results}
          variables={variables}
          isQuerying={isQuerying}
          selectedQuery={selectedQuery}
        />
      )}
    </div>
  );
}

/**
 * Creates an EventEmitter that handles how the UI states should change on certain events.
 * @param {Function} setVariables sets the variables of the query.
 * @param {Function} resultAdder a function that processes the results.
 * @param {Function} setIsQuerying a function that sets whether the query is finished or not.
 * @returns
 */
function makeUIEventEmitter(
  setVariables,
  setResultType,
  setQuerying,
  setErrorMessage
) {
  const eventEmitter = new EventEmitter();

  eventEmitter.on("resultType", (type) => {
    setResultType(type);
  });

  // An error message
  eventEmitter.on("error", (error) => {
    setErrorMessage(error);
  });

  // The variables of the query
  eventEmitter.on("variables", (variables) => {
    setVariables(variables);
  });

  // Whether there is currently being queried or not
  eventEmitter.on("queryingStatus", (isQuerying) => {
    setQuerying(isQuerying);
  });

  return eventEmitter;
}

const adderFunctionMapper = {
  bindings: (setter) => {
    return ({ item, variables }) => bindingStreamAdder(item, variables, setter);
  },
  boolean: (setter, query) => {
    let resultObject = query.askQuery;
    return (result) => result ? setter(resultObject.trueText) : setter(resultObject.falseText);
  },
  quads: (setter) => {
    return ({ item }) => {
      quadStreamAdder(item, setter)
    };
  }
};

/**
 * Processes a result entry as it should look in the result table, and adds it to the table entries
 * @param {Object} item The result entry that should be processed 
 * @param {Function} setter function to set the table entries. 
 */
function quadStreamAdder(item, setter) {
  const newValues = [item.subject.value, item.predicate.value, item.object.value, item.graph.value];
  setter((old) => {
    return [...old, newValues];
  });
}

/**
 * Processes a result entry as it should look in the result table, and adds it to the table entries
 * @param {Object} item the entry which should be processed
 * @param {Array<String>} variables A list of all the variables in the table
 * @param {Function} setter function to set the table entries.
 */
function bindingStreamAdder(item, variables, setter) {
  const newValues = [];
  for (let variable of variables) {
    const value = item.get(variable) ? item.get(variable) : "";
    const type = variable.split("_")[1];
    let componentCaller = typeRepresentationMapper[type];
    componentCaller = componentCaller ? componentCaller : (text) => text.id ? text.id : text.value;
    newValues.push(componentCaller(value));
  }

  setter((old) => {
    return [...old, newValues];
  });
}

/**
 * If there is currently an iterator active iterator, either a BindingStream or QuadStream, it removes all event listeners and stops the execution.
 */
function disableIterator() {
  if (iterator) {
    iterator.removeAllListeners("end");
    iterator.removeAllListeners("data");
    iterator.removeAllListeners("error");
    iterator.destroy();
  }
}

/**
 * Fetches the the query file from the given query and returns its text.
 * @param {query} query the query which is to be executed
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @returns the text from the file location provided by the query relative to query location defined in the config file.
 */
async function fetchQuery(query, eventEmitter) {
  try {
    const result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    return await result.text();
  } catch (error) {
    handleQueryFetchFail(error, eventEmitter);
  }
}

/**
 * A function that executes a given query and processes every result as a stream based on the EventEmitter.
 * @param {query} query the query which is to be executed
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} resultAdder function that sets UI state of the query result
 */
async function executeQuery(query, eventEmitter, resultAdder) {
  try {
    query.queryText = await fetchQuery(query, eventEmitter);
    const fetchFunction = getDefaultSession().info.isLoggedIn
      ? authFetch
      : fetch;
    
    let queryProxyHandler
    if(query.useProxy){
      queryProxyHandler = proxyHandler
    }
    return handleQueryExecution(
      await myEngine.query(query.queryText, {
        sources: query.sources,
        fetch: fetchFunction,
        httpProxyHandler: queryProxyHandler,
      }),
      query,
      eventEmitter,
      resultAdder
    );
  } catch (error) {
    handleQueryFail(error, eventEmitter);
  }
}

/**
 * A function that given a QueryType processes every result as a stream.
 *
 * @param {QueryType} execution a query execution
 * @param {query} query the query which is being executed
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} adder function that sets UI state of the query result
 */
async function handleQueryExecution(execution, query, eventEmitter, resultAdder) {
  try {
    let variables;
    const resultType = execution.resultType;
    const adder = (obj) => adderFunctionMapper[resultType](resultAdder, query)(obj);

    eventEmitter.emit("resultType", execution.resultType);

    if (execution.resultType !== "boolean") {
      const metadata = await execution.metadata();
      variables = metadata.variables.map((val) => {
        return val.value;
      });

    }

    queryTypeHandlers[execution.resultType](
      await execution.execute(),
      eventEmitter,
      adder,
      variables
    );
  } catch (error) {
    handleQueryExecutionFail(error, eventEmitter);
  }
}

const queryTypeHandlers = {
  bindings: configureBindingStream,
  quads: configureQuadStream,
  boolean: configureBool,
};

/**
 * Configures how a boolean query gets processed.
 * @param {Boolean} result the result of a boolean query
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} adder function that handles the result of a query as it should be processed
 */
function configureBool(result, eventEmitter, adder) {
  eventEmitter.emit("queryingStatus", false);
  adder(result);
}

/**
 *
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} adder function that handles the result of a query as it should be processed
 */
function configureIterator(variables, eventEmitter, adder) {
  iterator.on("data", (data) => {
    adder({ item: data, variables: variables });
  });

  iterator.on("end", () => {
    eventEmitter.emit("queryingStatus", false);
  });
}

/**
 * Configures how a query resulting in a stream of quads should be processed.
 * @param {AsyncIterator<Quad> & ResultStream<Quad>>} quadStream a stream of Quads
 * @param {BindingStream} bindingStream a stream of Bindings
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} adder function that handles the result of a query as it should be processed
 */
function configureQuadStream(quadStream, eventEmitter, adder, variables) {
  iterator = quadStream;
  eventEmitter.emit("variables", ["subject", "predicate", "object", "graph"]);
  configureIterator(variables, eventEmitter, adder);
}

/**
 * Configures how a query resulting in a stream of bindings should be processed.
 * @param {BindingStream} bindingStream a stream of Bindings
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 * @param {Function} adder function that handles the result of a query as it should be processed
 */
function configureBindingStream(bindingStream, eventEmitter, adder, variables) {
  iterator = bindingStream;
  eventEmitter.emit("variables", variables);
  configureIterator(variables, eventEmitter, adder);
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch for the query fails.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
function handleQueryFetchFail(error, eventEmitter) {
  eventEmitter.emit("queryingStatus", false);
  eventEmitter.emit("error", "Failed to fetch the query.");
}

/**
 * Handles the event whenever the Comunica query fails.
 * @param {Error} error the object returned by Comunica engine when the query function fails.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
function handleQueryFail(error, eventEmitter) {
  eventEmitter.emit("queryingStatus", false);
  eventEmitter.emit("error", "Something went wrong while preparing the query.");
}

/**
 * Handles the event whenever the execution of the query fails.
 * @param {Error} error the object returned by Comunica when the parsing of metadata or execution of the query fails.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
function handleQueryExecutionFail(error, eventEmitter) {
  eventEmitter.emit("queryingStatus", false);
  eventEmitter.emit("error", "Something went wrong while executing the query.");
}

export default RightField;
