import { act, findByTestId, render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ExtendableSelector from "../components/ExtendableSelector"




test('Load with hidden content', () => {
    render(<ExtendableSelector extendContent="Hello World!"/>)
    const hiddenContent = screen.queryByTestId("extended-content")
    expect(hiddenContent).not.toBeInTheDocument()
})

test('Clicking the button reveals hidden content.',() => {
    render(<ExtendableSelector extendContent="Hello World!"/>)
    act(() => {
        userEvent.click(screen.getByRole("button"))
    })
    const hiddenContent = screen.queryByTestId("extended-content")
    expect(hiddenContent).toBeInTheDocument()
})

test('Hidden content equals the extendContent prop', () => {
    render(<ExtendableSelector extendContent="Hello World!"/>)
    act(() => {
        userEvent.click(screen.getByRole("button"))
    })
    const hiddenContent = screen.queryByTestId("extended-content")
    expect(hiddenContent).toContainHTML("Hello World!")
})