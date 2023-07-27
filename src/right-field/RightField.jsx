import { useState, useEffect } from "react";
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

const EventEmitter = require("events");

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

  const eventEmitter = makeUIEventEmitter(setVariables, adder, setQuerying);

  /**
   * starts the execution of a query and adjusts the UI respectively. 
   */
  const startQueryExecution = () => {
    setTime(0);
    if (selectedQuery) {
      disableIterator();
      setResults([]);
      setVariables([]);
      iterator = undefined;
      setQuerying(true);
      executeQuery(selectedQuery, eventEmitter);
    }
  };

  useEffect(() => {
    startQueryExecution();
  }, [selectedQuery]);

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
            <div className="information-box">
              <label>
              <strong>Result Count:</strong>
              {results.length}
            </label>
            </div>
            
          )}
          {selectedQuery && (
            <strong id="query-name-label">{selectedQuery.name}</strong>
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
        <SolidLoginForm defaultIDP={config.defaultIDP} onClick={disableIterator} />
      </div>
      <ResultsTable
        results={results}
        variables={variables}
        isQuerying={isQuerying}
        selectedQuery={selectedQuery}
      />
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
function makeUIEventEmitter(setVariables, resultAdder, setQuerying) {
  let eventEmitter = new EventEmitter();

  // The variables of the query
  eventEmitter.on("variables", (variables) => {
    setVariables(variables);
  });

  // A new result
  eventEmitter.on("result", (result) => {
    resultAdder(result);
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
 * A function that executes a given query and processes every result as a stream based on the EventEmitter.
 * @param {query} query the query which is to be executed
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
async function executeQuery(query, eventEmitter) {
  try {
    let result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    query.queryText = await result.text();
    let fetchFunction = getDefaultSession().info.isLoggedIn ? authFetch : fetch;
    return handleQueryExecution(
      await myEngine.query(query.queryText, {
        sources: query.sources,
        fetch: fetchFunction,
      }),
      eventEmitter
    );
  } catch (error) {
    eventEmitter.emit("queryingStatus", false);
    handleQueryFetchFail(error);
  }
}

/**
 * A function that given a QueryType processes every result as a stream.
 *
 * @param {QueryType} execution a query execution
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
async function handleQueryExecution(execution, eventEmitter) {
  try {
    let metadata = await execution.metadata();
    let variables = metadata.variables.map((val) => {
      return val.value;
    });

    eventEmitter.emit("variables", variables);

    queryTypeHandlers[execution.resultType](
      await execution.execute(),
      variables,
      eventEmitter
    );
  } catch (error) {
    console.error(error.message); //TODO
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
 */
function configureBool(result) {
  postMessage({ type: "result", result: result });
  postMessage({ type: "end", message: "blank" });
}

/**
 *
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
function configureIterator(variables, eventEmitter) {
  iterator.on("data", (data) => {
    eventEmitter.emit("result", { variables: variables, item: data });
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
 */
function configureQuadStream(quadStream, variables, eventEmitter) {
  iterator = quadStream;
  configureIterator(variables, eventEmitter);
}

/**
 * Configures how a query resulting in a stream of bindings should be processed.
 * @param {BindingStream} bindingStream a stream of Bindings
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 * @param {EventEmitter} eventEmitter an EventEmitter that listens to and emits UI state changes.
 */
function configureBindingStream(bindingStream, variables, eventEmitter) {
  iterator = bindingStream;
  configureIterator(variables, eventEmitter);
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails.
 */
function handleQueryFetchFail(error) {
  console.error(error);
}

export default RightField;
