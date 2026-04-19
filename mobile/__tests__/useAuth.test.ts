import { renderHook, waitFor, act } from '@testing-library/react-native'
import { useAuth } from '../src/hooks/useAuth'

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}))

jest.mock('../src/lib/firebase', () => ({
  auth: {},
  db: {},
}))

import { onAuthStateChanged } from 'firebase/auth'
import { getDoc } from 'firebase/firestore'

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>

const fakeUser = { uid: 'user123', email: 'test@example.com' } as any

beforeEach(() => {
  jest.clearAllMocks()
  // Default: return an unsubscribe no-op and never call the callback
  mockOnAuthStateChanged.mockReturnValue(jest.fn())
})

describe('useAuth', () => {
  it('starts with loading true and no user', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.role).toBeNull()
  })

  it('sets user and role after sign-in', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      Promise.resolve().then(() => (callback as Function)(fakeUser))
      return jest.fn()
    })

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'researcher' }),
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toBe(fakeUser)
    expect(result.current.role).toBe('researcher')
  })

  it('sets role to null when user doc does not exist', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      Promise.resolve().then(() => (callback as Function)(fakeUser))
      return jest.fn()
    })

    mockGetDoc.mockResolvedValue({ exists: () => false } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toBe(fakeUser)
    expect(result.current.role).toBeNull()
  })

  it('clears user and role on sign-out', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      Promise.resolve().then(() => (callback as Function)(null))
      return jest.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(result.current.role).toBeNull()
  })

  it('calls the unsubscribe function on unmount', () => {
    const unsubscribe = jest.fn()
    mockOnAuthStateChanged.mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => useAuth())
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
