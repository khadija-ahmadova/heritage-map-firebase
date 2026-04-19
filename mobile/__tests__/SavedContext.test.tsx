import React from 'react'
import { Text } from 'react-native'
import { render, act, waitFor } from '@testing-library/react-native'
import { SavedProvider, useSaved } from '../src/context/SavedContext'
import type { Monument } from '../src/hooks/useMonuments'

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn((_db, ...segments) => ({ path: segments.join('/') })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
}))

jest.mock('../src/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}))

import { onAuthStateChanged } from 'firebase/auth'
import { getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth } from '../src/lib/firebase'

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>

const monument: Monument = {
  id: 'mon1',
  name: 'Palace',
  location: 'Baku',
  period: '15th',
  architect: 'Unknown',
  description: 'A palace.',
  simplified_desc: '',
  fun_fact: '',
  imageUrl: [],
  coordinates: { latitude: 40.37, longitude: 49.84 },
}

const monument2: Monument = { ...monument, id: 'mon2', name: 'Tower' }
const monument3: Monument = { ...monument, id: 'mon3', name: 'Gate' }
const monument4: Monument = { ...monument, id: 'mon4', name: 'Fort' }

// Helper: renders a consumer component and exposes the context value
function renderWithProvider() {
  let ctx: ReturnType<typeof useSaved>
  function Consumer() {
    ctx = useSaved()
    return (
      <>
        <Text testID="saved-count">{ctx.wantToVisit.length}</Text>
        <Text testID="routes-count">{ctx.savedRoutes.length}</Text>
        <Text testID="past-count">{ctx.pastRoutes.length}</Text>
      </>
    )
  }
  const utils = render(<SavedProvider><Consumer /></SavedProvider>)
  return { ...utils, getCtx: () => ctx! }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Default: sign-out (null user), with empty Firestore collections
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
    (cb as Function)(null)
    return jest.fn()
  })
  mockGetDocs.mockResolvedValue({ docs: [] } as any)
  mockGetDoc.mockResolvedValue({ exists: () => false } as any)
  mockSetDoc.mockResolvedValue(undefined)
  mockDeleteDoc.mockResolvedValue(undefined)
  // Reset auth.currentUser
  ;(auth as any).currentUser = null
})

// ── isSaved ──────────────────────────────────────────────────────────────────

describe('isSaved', () => {
  it('returns false when monument has not been saved', () => {
    const { getCtx } = renderWithProvider()
    expect(getCtx().isSaved('mon1')).toBe(false)
  })
})

// ── saveMonument / unsaveMonument ─────────────────────────────────────────────

describe('saveMonument', () => {
  it('adds monument to wantToVisit when user is logged in', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })

    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(1))
    expect(getCtx().isSaved('mon1')).toBe(true)
  })

  it('does not add duplicate monuments', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })
    act(() => { getCtx().saveMonument(monument) })

    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(1))
  })

  it('does nothing when no user is logged in', () => {
    ;(auth as any).currentUser = null
    const { getCtx } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })

    expect(getCtx().isSaved('mon1')).toBe(false)
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('calls setDoc to persist to Firestore', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    const { getCtx } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })

    await waitFor(() => expect(mockSetDoc).toHaveBeenCalledTimes(1))
  })
})

describe('unsaveMonument', () => {
  it('removes the monument from wantToVisit', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })
    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(1))

    act(() => { getCtx().unsaveMonument('mon1') })
    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(0))
    expect(getCtx().isSaved('mon1')).toBe(false)
  })

  it('calls deleteDoc to remove from Firestore', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    const { getCtx } = renderWithProvider()

    act(() => { getCtx().saveMonument(monument) })
    act(() => { getCtx().unsaveMonument('mon1') })

    await waitFor(() => expect(mockDeleteDoc).toHaveBeenCalledTimes(1))
  })
})

// ── saveRoute / removeSavedRoute ──────────────────────────────────────────────

describe('saveRoute', () => {
  it('adds route to savedRoutes', async () => {
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => {
      getCtx().saveRoute({ name: 'My Route', monuments: [monument], mode: 'foot-walking' })
    })

    await waitFor(() => expect(getByTestId('routes-count').props.children).toBe(1))
    expect(getCtx().savedRoutes[0].name).toBe('My Route')
  })
})

describe('removeSavedRoute', () => {
  it('removes route from savedRoutes', async () => {
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => {
      getCtx().saveRoute({ name: 'My Route', monuments: [monument], mode: 'foot-walking' })
    })
    await waitFor(() => expect(getByTestId('routes-count').props.children).toBe(1))

    const routeId = getCtx().savedRoutes[0].id
    act(() => { getCtx().removeSavedRoute(routeId) })

    await waitFor(() => expect(getByTestId('routes-count').props.children).toBe(0))
  })
})

// ── pushPastRoute ─────────────────────────────────────────────────────────────

describe('pushPastRoute', () => {
  it('adds a past route', async () => {
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => {
      getCtx().pushPastRoute({ name: 'Route A', monuments: [monument], mode: 'foot-walking' })
    })

    await waitFor(() => expect(getByTestId('past-count').props.children).toBe(1))
  })

  it('keeps only the last 3 past routes', async () => {
    const { getCtx, getByTestId } = renderWithProvider()

    act(() => {
      getCtx().pushPastRoute({ name: 'A', monuments: [monument], mode: 'foot-walking' })
      getCtx().pushPastRoute({ name: 'B', monuments: [monument2], mode: 'foot-walking' })
      getCtx().pushPastRoute({ name: 'C', monuments: [monument3], mode: 'foot-walking' })
      getCtx().pushPastRoute({ name: 'D', monuments: [monument4], mode: 'foot-walking' })
    })

    await waitFor(() => expect(getByTestId('past-count').props.children).toBe(3))
    // Most recent first
    expect(getCtx().pastRoutes[0].name).toBe('D')
  })
})

// ── Firestore rehydration ────────────────────────────────────────────────────

describe('rehydration on sign-in', () => {
  it('loads saved monuments from Firestore when user signs in', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      Promise.resolve().then(() => (cb as Function)({ uid: 'user1' }))
      return jest.fn()
    })

    // saved_landmarks returns one doc pointing to mon1
    mockGetDocs
      .mockResolvedValueOnce({
        docs: [{ data: () => ({ landmark_id: 'mon1', user_uid: 'user1' }) }],
      } as any)
      // routes returns empty
      .mockResolvedValueOnce({ docs: [] } as any)

    // Monument doc for mon1
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'mon1',
      data: () => ({
        name: 'Palace', location: 'Baku', period: '15th', architect: 'Unknown',
        description: 'A palace.', coordinates: { latitude: 40.37, longitude: 49.84 },
      }),
    } as any)

    const { getByTestId } = renderWithProvider()

    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(1))
  })

  it('clears state on sign-out', async () => {
    ;(auth as any).currentUser = { uid: 'user1' }
    let authCallback: Function

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      authCallback = cb as Function
      // sign in immediately
      Promise.resolve().then(() => authCallback({ uid: 'user1' }))
      return jest.fn()
    })

    mockGetDocs.mockResolvedValue({ docs: [] } as any)

    const { getCtx, getByTestId } = renderWithProvider()
    // add a monument locally
    act(() => { getCtx().saveMonument(monument) })
    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(1))

    // sign out
    act(() => { authCallback(null) })
    await waitFor(() => expect(getByTestId('saved-count').props.children).toBe(0))
  })
})
