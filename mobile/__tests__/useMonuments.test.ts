import { renderHook, waitFor } from '@testing-library/react-native'
import { useMonuments } from '../src/hooks/useMonuments'

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}))

// Mock the firebase db export
jest.mock('../src/lib/firebase', () => ({
  db: {},
}))

import { getDocs } from 'firebase/firestore'
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>

const makeSnapshot = (docs: { id: string; data: () => object }[]) => ({
  docs: docs.map((d) => ({ id: d.id, data: d.data })),
})

const sampleDoc = {
  id: 'abc123',
  data: () => ({
    name: 'Palace of the Shirvanshahs',
    coordinates: { latitude: 40.3667, longitude: 49.8352 },
    location: 'Old City, Baku',
    period: '15th century',
    architect: 'Unknown',
    description: 'A palace complex in the walled city.',
  }),
}

describe('useMonuments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with loading true and empty monuments', () => {
    // getDocs never resolves during this check
    mockGetDocs.mockReturnValue(new Promise(() => {}) as any)

    const { result } = renderHook(() => useMonuments())

    expect(result.current.loading).toBe(true)
    expect(result.current.monuments).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns monuments array and loading false after successful fetch', async () => {
    mockGetDocs.mockResolvedValueOnce(makeSnapshot([sampleDoc]) as any)

    const { result } = renderHook(() => useMonuments())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.monuments).toHaveLength(1)
    expect(result.current.monuments[0]).toEqual({
      id: 'abc123',
      name: 'Palace of the Shirvanshahs',
      coordinates: { latitude: 40.3667, longitude: 49.8352 },
      location: 'Old City, Baku',
      period: '15th century',
      architect: 'Unknown',
      description: 'A palace complex in the walled city.',
    })
    expect(result.current.error).toBeNull()
  })

  it('sets error and stops loading when getDocs throws', async () => {
    const fetchError = new Error('Firestore unavailable')
    mockGetDocs.mockRejectedValueOnce(fetchError)

    const { result } = renderHook(() => useMonuments())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe(fetchError)
    expect(result.current.monuments).toEqual([])
  })

  it('returns empty array when collection is empty', async () => {
    mockGetDocs.mockResolvedValueOnce(makeSnapshot([]) as any)

    const { result } = renderHook(() => useMonuments())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.monuments).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
