import ResultsTable from "./results-table/ResultsTable";
import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";

function App() {
  return (
    <div className="App">
      <h1 className="app-title">Generic Data Viewer</h1>
      <div className="app-body">
        <SelectionTable />
        <div className="right-field">
          <ResultsTable/>
        </div>
      </div>
      <footer>
        
      </footer>
    </div>
  );
}

export default App;
