import { useRef, useState, useEffect } from "react";
import ResultsTable from "./results-table/ResultsTable";
import "./RightField.css";
import QueryWorker from "worker-loader!../workers/worker";
import { typeRepresentationMapper } from "../typeMapper.js";
import config from "../config.json";
import Time from "../components/Time";

if (!config.queryFolder) {
  config.queryFolder = "./";
}

if (config.queryFolder.substring(config.queryFolder.length - 1) !== "/") {
  config.queryFolder = `${config.queryFolder}/`;
}

let queryWorker = undefined;

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

  useEffect(() => {
    configureQueryWorker(adder, setVariables, setQuerying);
  }, []);

  let adder = adderFunctionMapper["bindings"](setResults);

  const onQueryChanged = () => {
    setTime(0);
    if (selectedQuery) {
      if (isQuerying) {
        queryWorker.terminate();
        configureQueryWorker(adder, setVariables, setQuerying);
      }
      setResults([]);
      setVariables([]);
      setQuerying(true);
      executeQuery(selectedQuery, queryWorker);
    }
  };

  useEffect(() => {
    onQueryChanged();
  }, [selectedQuery]);

  return (
    <div
      className="right-field"
      style={{ backgroundColor: config.mainAppColor }}
    >
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
              {isQuerying && <strong>Runtime:</strong>}
              {!isQuerying && <strong>Finished in:</strong>}
              <Time time={time} showMilliseconds={config.showMilliseconds} />
            </label>
          )}
        </div>
        <button id="login-button">Login</button>
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
    return (item, variable) => bindingStreamAdder(item, variable, setter);
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
    let value = item[variable] ? item[variable] : "";
    let type = variable.split("_")[1];
    let componentCaller = typeRepresentationMapper[type];
    componentCaller = componentCaller ? componentCaller : (text) => text.value;
    newValues.push(componentCaller(value));
  }

  setter((old) => {
    return [...old, newValues];
  });
}

/**
 *
 * @param {Function} adder function which processes the result, takes the result as argument
 * @param {Function} variableSetter setter function for the variables, takes a list of variable names
 * @param {Function} setIsQuerying boolean setter function for whether the worker is still executing a query or not
 */
function configureQueryWorker(adder, variableSetter, setIsQuerying) {
  queryWorker = new QueryWorker();
  let variablesMain = [];
  queryWorker.onmessage = ({ data }) => {
    switch (data.type) {
      case "result":
        let binding = JSON.parse(data.result);
        let entries = binding.entries;
        adder(entries, variablesMain);

        break;
      case "end":
        setIsQuerying(false);
        break;
      case "metadata": {
        variablesMain = data.metadata.variables.map((val) => val.value);
        variableSetter(variablesMain);
        break;
      }
    }
  };
}

/**
 * A function that executes a given query and processes every result as a stream based on the functions provided.
 * @param {query} query the query which gets executed
 * @param {Worker} queryWorker the worker which will be used to execute the given query
 */
async function executeQuery(query, queryWorker) {
  try {
    let result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    query.queryText = await result.text();
    queryWorker.postMessage({ selectedQuery: query });
  } catch (error) {
    handleQueryFetchFail(error);
  }
}

/**
 * Handles the event whenever the fetching of a query fails.
 * @param {Error} error the object returned by the fetch API whenever the fetch fails.
 */
function handleQueryFetchFail(error) {
  console.error(error);
}

export default RightField;
