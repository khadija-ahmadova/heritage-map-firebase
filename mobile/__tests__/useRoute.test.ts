import { renderHook, act } from '@testing-library/react-native'
import { useRoute } from '../src/hooks/useRoute'

const mockFetch = jest.fn()
global.fetch = mockFetch

const stops = [
  { latitude: 40.37, longitude: 49.84 },
  { latitude: 40.41, longitude: 49.87 },
]

const makeOrsResponse = (distanceM: number, durationS: number, coords: number[][]) => ({
  ok: true,
  json: async () => ({
    features: [
      {
        geometry: { coordinates: coords },
        properties: { summary: { distance: distanceM, duration: durationS } },
      },
    ],
  }),
})

beforeEach(() => jest.clearAllMocks())

describe('useRoute', () => {
  it('starts with no result, not loading, no error', () => {
    const { result } = renderHook(() => useRoute())

    expect(result.current.routeResult).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('does nothing when fewer than 2 stops are provided', async () => {
    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute([stops[0]], 'foot-walking')
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.routeResult).toBeNull()
  })

  it('sets routeResult with parsed coordinates on success', async () => {
    mockFetch.mockResolvedValue(
      makeOrsResponse(2500, 1800, [[49.84, 40.37], [49.85, 40.38], [49.87, 40.41]])
    )

    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute(stops, 'foot-walking')
    })

    expect(result.current.routeResult).not.toBeNull()
    expect(result.current.routeResult?.distanceKm).toBe(2.5)
    expect(result.current.routeResult?.durationMin).toBe(30)
    expect(result.current.routeResult?.coordinates).toHaveLength(3)
    expect(result.current.routeResult?.coordinates[0]).toEqual({ latitude: 40.37, longitude: 49.84 })
    expect(result.current.error).toBe('')
  })

  it('sets error when API returns no features', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    })

    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute(stops, 'driving-car')
    })

    expect(result.current.routeResult).toBeNull()
    expect(result.current.error).toBe('No route found.')
  })

  it('sets error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute(stops, 'cycling-regular')
    })

    expect(result.current.routeResult).toBeNull()
    expect(result.current.error).toBe('Failed to fetch route.')
    expect(result.current.loading).toBe(false)
  })

  it('clears the route result when clearRoute is called', async () => {
    mockFetch.mockResolvedValue(
      makeOrsResponse(1000, 600, [[49.84, 40.37], [49.87, 40.41]])
    )

    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute(stops, 'foot-walking')
    })

    expect(result.current.routeResult).not.toBeNull()

    act(() => {
      result.current.clearRoute()
    })

    expect(result.current.routeResult).toBeNull()
  })

  it('sends coordinates in [longitude, latitude] order to the API', async () => {
    mockFetch.mockResolvedValue(
      makeOrsResponse(1000, 600, [[49.84, 40.37], [49.87, 40.41]])
    )

    const { result } = renderHook(() => useRoute())

    await act(async () => {
      await result.current.fetchRoute(stops, 'foot-walking')
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.coordinates[0]).toEqual([49.84, 40.37]) // [lng, lat]
    expect(body.coordinates[1]).toEqual([49.87, 40.41])
  })
})
