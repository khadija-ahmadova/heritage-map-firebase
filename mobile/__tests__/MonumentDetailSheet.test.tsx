import React from 'react'
import { render } from '@testing-library/react-native'
import MonumentDetailSheet from '../src/components/MonumentDetailSheet'
import type { Monument } from '../src/hooks/useMonuments'

// SavedContext now uses Firebase — mock it out so the test stays unit-level
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {}), // returns unsubscribe no-op; never calls callback
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}))

jest.mock('../src/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}))

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

    // Name is its own Text node
    expect(getByText('Palace of the Shirvanshahs')).toBeTruthy()
    // Period, architect, and description are joined into a single Text node — use regex
    expect(getByText(/15th century/)).toBeTruthy()
    expect(getByText(/Unknown/)).toBeTruthy()
    expect(getByText(/A palace complex in the walled city of Baku\./)).toBeTruthy()
  })

  it('shows save button and navigate/share action buttons', () => {
    const { getByLabelText } = render(
      <MonumentDetailSheet monument={sampleMonument} onClose={() => {}} />
    )

    expect(getByLabelText('Save monument')).toBeTruthy()
    expect(getByLabelText('Navigate to monument')).toBeTruthy()
    expect(getByLabelText('Share monument')).toBeTruthy()
  })
})
