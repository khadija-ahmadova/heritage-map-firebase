import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ExploreSheet from '../src/components/ExploreSheet'
import type { Monument } from '../src/hooks/useMonuments'

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff', card: '#FFF3EC', text: '#1a1a1a',
      subtext: '#292828', border: '#ffddc4', header: '#ffffff',
      accent: '#6E3606', accentSecondary: '#E8A876',
    },
  }),
}))

jest.mock('geofire-common', () => ({
  distanceBetween: jest.fn(([lat1, lon1]: number[], [lat2, lon2]: number[]) => {
    const dx = lat2 - lat1
    const dy = lon2 - lon1
    return Math.sqrt(dx * dx + dy * dy) * 111 // rough km approximation
  }),
}))

const makeMonument = (overrides: Partial<Monument> & { id: string }): Monument => ({
  name: 'Monument',
  location: 'Baku',
  period: '15th century',
  architect: 'Unknown',
  description: '',
  simplified_desc: '',
  fun_fact: '',
  imageUrl: [],
  coordinates: { latitude: 40.37, longitude: 49.84 },
  ...overrides,
})

const monuments: Monument[] = [
  makeMonument({ id: '1', name: 'Palace', architect: 'Ali', period: '15th century' }),
  makeMonument({ id: '2', name: 'Tower', architect: 'Veli', period: '12th century' }),
  makeMonument({ id: '3', name: 'Gate', architect: 'Ali', period: '15th century' }),
]

const defaultProps = {
  visible: true,
  monuments,
  userLocation: null,
  onClose: jest.fn(),
  onSelectMonument: jest.fn(),
  onFilterChange: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('ExploreSheet', () => {
  it('renders nothing when visible is false', () => {
    const { toJSON } = render(<ExploreSheet {...defaultProps} visible={false} />)
    expect(toJSON()).toBeNull()
  })

  it('renders the Explore title', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)
    expect(getByText('Explore')).toBeTruthy()
  })

  it('shows the total monument count', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)
    expect(getByText('3 monuments')).toBeTruthy()
  })

  it('renders all monument names', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)
    expect(getByText('Palace')).toBeTruthy()
    expect(getByText('Tower')).toBeTruthy()
    expect(getByText('Gate')).toBeTruthy()
  })

  it('calls onSelectMonument when a monument card is pressed', () => {
    const onSelectMonument = jest.fn()
    const { getByText } = render(
      <ExploreSheet {...defaultProps} onSelectMonument={onSelectMonument} />
    )
    fireEvent.press(getByText('Palace'))
    expect(onSelectMonument).toHaveBeenCalledWith(monuments[0])
  })

  it('renders architect filter chips', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)
    // Two unique architects: Ali, Veli
    expect(getByText('Ali')).toBeTruthy()
    expect(getByText('Veli')).toBeTruthy()
  })

  it('renders period filter chips', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)
    expect(getByText('15th century')).toBeTruthy()
    expect(getByText('12th century')).toBeTruthy()
  })

  it('filters monuments by architect when chip is pressed', () => {
    const onFilterChange = jest.fn()
    const { getByText } = render(
      <ExploreSheet {...defaultProps} onFilterChange={onFilterChange} />
    )

    fireEvent.press(getByText('Veli'))

    // Only Tower has architect Veli — count chip should update
    expect(getByText('1 monuments')).toBeTruthy()
  })

  it('filters monuments by period when chip is pressed', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)

    fireEvent.press(getByText('12th century'))

    // Only Tower has 12th century period
    expect(getByText('1 monuments')).toBeTruthy()
  })

  it('shows "Clear all" button when a filter is active', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)

    fireEvent.press(getByText('Ali'))

    expect(getByText('Clear all')).toBeTruthy()
  })

  it('clears all filters when "Clear all" is pressed', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)

    fireEvent.press(getByText('Ali'))
    expect(getByText('2 monuments')).toBeTruthy()

    fireEvent.press(getByText('Clear all'))
    expect(getByText('3 monuments')).toBeTruthy()
  })

  it('shows "No monuments match" when filters exclude everything', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)

    // Select both incompatible filters
    fireEvent.press(getByText('Ali'))
    fireEvent.press(getByText('12th century'))

    expect(getByText('No monuments match the current filters')).toBeTruthy()
  })

  it('toggles the distance range filter on/off', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} />)

    const toggle = getByText('Off')
    fireEvent.press(toggle)
    expect(getByText('On')).toBeTruthy()
  })

  it('shows GPS warning when distance filter is on but no user location', () => {
    const { getByText } = render(<ExploreSheet {...defaultProps} userLocation={null} />)

    fireEvent.press(getByText('Off'))

    expect(getByText('GPS unavailable')).toBeTruthy()
  })

  it('calls onFilterChange with null when no filters are active', () => {
    const onFilterChange = jest.fn()
    render(<ExploreSheet {...defaultProps} onFilterChange={onFilterChange} />)

    // The effect runs on mount with no active filters
    expect(onFilterChange).toHaveBeenCalledWith(null)
  })

  it('calls onFilterChange with a Set of matching ids when a filter is active', () => {
    const onFilterChange = jest.fn()
    const { getByText } = render(
      <ExploreSheet {...defaultProps} onFilterChange={onFilterChange} />
    )

    fireEvent.press(getByText('Veli'))

    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0]
    expect(lastCall).toBeInstanceOf(Set)
    expect(lastCall.has('2')).toBe(true) // Tower has id '2'
    expect(lastCall.has('1')).toBe(false)
  })
})
