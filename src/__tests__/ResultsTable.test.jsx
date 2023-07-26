import {render, screen } from "@testing-library/react"
import '@testing-library/jest-dom'
import ResultsTable from '../right-field/results-table/ResultsTable'


test('Load with a label mentioning no query is yet selected.', () => {
    const {container} = render(<ResultsTable></ResultsTable>)
    let parentDiv = container.firstChild
    let noQueryLabel = screen.queryByTestId('no-query-label')
    expect(parentDiv.firstChild).toEqual(parentDiv.lastChild)
    expect(noQueryLabel).toBeInTheDocument()
})

test('Label mentioning no query is selected is not present if query is selected', () => {
    render(<ResultsTable variables={["Test1"]} results={["testData"]} selectedQuery={{name: "Test query"}}></ResultsTable>)
    let noQueryLabel = screen.queryByTestId('no-query-label')
    expect(noQueryLabel).not.toBeInTheDocument()
})

test('A query with variables exposes the gridjs table', () => {
    const {container} = render(<ResultsTable variables={["Test1"]} results={["testData"]} selectedQuery={{name: "Test query"}}></ResultsTable>)
    let gridJsTable = container.getElementsByClassName('gridjs').item(0)
    expect(gridJsTable).not.toBeUndefined()  
})