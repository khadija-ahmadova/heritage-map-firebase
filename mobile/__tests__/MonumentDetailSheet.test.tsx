import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import MonumentDetailSheet from '../src/components/MonumentDetailSheet'
import type { Monument } from '../src/hooks/useMonuments'

// ThemeContext uses AsyncStorage — mock with stable light-mode values
jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      background: '#ffffff',
      card: '#FFF3EC',
      text: '#1a1a1a',
      subtext: '#292828',
      border: '#ffddc4',
      header: '#ffffff',
      accent: '#6E3606',
      accentSecondary: '#E8A876',
    },
    toggleTheme: jest.fn(),
    notifications: true,
    setNotifications: jest.fn(),
    location: true,
    setLocation: jest.fn(),
  }),
}))

// SavedContext uses Firebase — mock at unit level
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {}),
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
  addDoc: jest.fn(),
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
  simplified_desc: '',
  fun_fact: '',
  imageUrl: [],
}

const defaultProps = {
  monument: sampleMonument,
  onClose: jest.fn(),
  onCreateRoute: jest.fn(),
  onMoreInfo: jest.fn(),
}

describe('MonumentDetailSheet', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing when monument is null', () => {
    const { toJSON } = render(
      <MonumentDetailSheet
        monument={null}
        onClose={jest.fn()}
        onCreateRoute={jest.fn()}
        onMoreInfo={jest.fn()}
      />
    )
    expect(toJSON()).toBeNull()
  })

  it('renders the monument name', () => {
    const { getByText } = render(<MonumentDetailSheet {...defaultProps} />)
    expect(getByText('Palace of the Shirvanshahs')).toBeTruthy()
  })

  it('renders period, architect and location in the details section', () => {
    const { getByText } = render(<MonumentDetailSheet {...defaultProps} />)
    expect(getByText(/15th century/)).toBeTruthy()
    expect(getByText(/Unknown/)).toBeTruthy()
    expect(getByText(/Old City, Baku/)).toBeTruthy()
  })

  it('renders the Save, Share and Add to Route action labels', () => {
    const { getByText } = render(<MonumentDetailSheet {...defaultProps} />)
    expect(getByText('Save')).toBeTruthy()
    expect(getByText('Share')).toBeTruthy()
    expect(getByText('Add to Route')).toBeTruthy()
  })

  it('calls onCreateRoute with the monument when the add-to-route button is pressed', () => {
    const onCreateRoute = jest.fn()
    const { UNSAFE_getAllByType } = render(
      <MonumentDetailSheet {...defaultProps} onCreateRoute={onCreateRoute} />
    )
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity } = require('react-native')
    // Three TouchableOpacity buttons: Save (0), Share (1), Add to Route (2)
    const buttons = UNSAFE_getAllByType(TouchableOpacity)
    fireEvent.press(buttons[2])
    expect(onCreateRoute).toHaveBeenCalledWith(sampleMonument)
  })
})
