import "./App.css"
import SelectionTable from "./selection-table/SelectionTable";
import RightField from "./right-field/RightField";

function App() {
  return (
    <div className="App">
      <h1 className="app-title">Generic Data Viewer</h1>
      <div className="app-body">
        <SelectionTable />
        <RightField />
      </div>
      <footer><p><a href="https://idlab.technology/">IDLab</a> - <a href="https://www.imec.be/nl">imec</a> - <a href="https://www.ugent.be/">UGent</a></p></footer>

    </div>
  );
}

export default App;
