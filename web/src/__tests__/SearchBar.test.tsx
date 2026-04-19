import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SearchBar from '../components/search/SearchBar'
import type { Monuments } from '../types/Monuments'

vi.mock('../services/filterService', () => ({
  searchMonuments: vi.fn(),
}))

import { searchMonuments } from '../services/filterService'

const mockMonuments = [
  { id: '1', name: 'Palace of the Shirvanshahs', architect: 'Unknown', period: '15th century', location: 'Baku', style: 'Medieval', description: '', coordinates: {} },
  { id: '2', name: 'Maiden Tower', architect: 'Unknown', period: '12th century', location: 'Baku', style: 'Stone', description: '', coordinates: {} },
] as unknown as Monuments[]

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

async function typeAndFlush(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
  await act(async () => {
    await vi.runAllTimersAsync()
  })
}

describe('SearchBar', () => {
  it('renders the input with placeholder text', () => {
    render(<SearchBar onSelect={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search monuments/i)).toBeInTheDocument()
  })

  it('does not call searchMonuments for blank input', async () => {
    render(<SearchBar onSelect={vi.fn()} />)
    await typeAndFlush(screen.getByRole('textbox'), '   ')
    expect(searchMonuments).not.toHaveBeenCalled()
  })

  it('shows results after debounce delay', async () => {
    vi.mocked(searchMonuments).mockResolvedValue(mockMonuments)

    render(<SearchBar onSelect={vi.fn()} />)
    await typeAndFlush(screen.getByRole('textbox'), 'Palace')

    expect(screen.getByText('Palace of the Shirvanshahs')).toBeInTheDocument()
    expect(screen.getByText('Maiden Tower')).toBeInTheDocument()
  })

  it('calls onSelect with the chosen monument and clears the input', async () => {
    const onSelect = vi.fn()
    vi.mocked(searchMonuments).mockResolvedValue(mockMonuments)

    render(<SearchBar onSelect={onSelect} />)
    await typeAndFlush(screen.getByRole('textbox'), 'Palace')

    fireEvent.click(screen.getByText('Palace of the Shirvanshahs'))

    expect(onSelect).toHaveBeenCalledWith(mockMonuments[0])
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('hides results after selecting an item', async () => {
    vi.mocked(searchMonuments).mockResolvedValue(mockMonuments)

    render(<SearchBar onSelect={vi.fn()} />)
    await typeAndFlush(screen.getByRole('textbox'), 'Palace')

    fireEvent.click(screen.getByText('Palace of the Shirvanshahs'))

    expect(screen.queryByText('Maiden Tower')).not.toBeInTheDocument()
  })
})
