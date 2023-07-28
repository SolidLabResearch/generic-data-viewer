import config from "../config.json";
import { render } from "@testing-library/react"
import '@testing-library/jest-dom'
import RightField from "../right-field/RightField";
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

if (!config.queryFolder) {
    config.queryFolder = "./";
}

test("When no query is selected there is no query information", () => {
    const {container} = render(<RightField/>)
    let queryInformationDiv = container.querySelector('#query-information')
    expect(queryInformationDiv.children.length).toEqual(0)
})

test("When a query is selected, the query information is shown", () => {
    const {container} = render(<RightField query={config.queries[0]}/>)
    let queryInformationDiv = container.querySelector('#query-information')
    expect(queryInformationDiv.children.length).not.toEqual(0)
})