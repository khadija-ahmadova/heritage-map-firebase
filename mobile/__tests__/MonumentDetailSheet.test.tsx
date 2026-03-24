import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import MonumentDetailSheet from '../src/components/MonumentDetailSheet'
import type { Monument } from '../src/hooks/useMonuments'

const sampleMonument: Monument = {
  id: 'abc123',
  name: 'Palace of the Shirvanshahs',
  period: '15th century',
  architect: 'Unknown',
  location: 'Old City, Baku',
  description: 'A palace complex in the walled city of Baku.',
  coordinates: { latitude: 40.3667, longitude: 49.8352 },
}

describe('MonumentDetailSheet', () => {
  it('renders nothing when monument is null', () => {
    const { toJSON } = render(
      <MonumentDetailSheet monument={null} onClose={() => {}} />
    )
    expect(toJSON()).toBeNull()
  })

  it('renders name, period, architect, and description when monument is provided', () => {
    const { getByText } = render(
      <MonumentDetailSheet monument={sampleMonument} onClose={() => {}} />
    )

    expect(getByText('Palace of the Shirvanshahs')).toBeTruthy()
    expect(getByText('15th century')).toBeTruthy()
    expect(getByText('Unknown')).toBeTruthy()
    expect(getByText('A palace complex in the walled city of Baku.')).toBeTruthy()
  })

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn()
    const { getByLabelText } = render(
      <MonumentDetailSheet monument={sampleMonument} onClose={onClose} />
    )

    fireEvent.press(getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
