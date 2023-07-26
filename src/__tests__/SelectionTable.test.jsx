import { act, render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ExtendableSelector from "../components/ExtendableSelector"
import SelectionTable from "../selection-table/SelectionTable"



test('There is a list item for every query', () => {
    let queries = ['test1', 'test2', 'test3']
    const {container} = render(<SelectionTable queries={queries}/>)
    let items = container.getElementsByTagName('li')
    expect(queries.length).toEqual(items.length)
})

test('Clicking on the button of a list item triggers the onClick', () => {
    let clickCount = 0
    const onClick = jest.fn(() => clickCount++)
    let queries = ['test1', 'test2', 'test3']
    const {container} = render(<SelectionTable queries={queries} onSelected={onClick}/>)
    let items = container.getElementsByTagName('button')
    userEvent.click(items[0])
    expect(onClick).toBeCalled()
})