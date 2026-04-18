import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSavedRoutesForUser } from '../services/Routeservice'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}))

vi.mock('../lib/firebase', () => ({ db: {} }))

import { getDocs, getDoc } from 'firebase/firestore'

const mockMonument = {
  name: 'Palace',
  location: 'Old City',
  period: '15th',
  architect: 'Unknown',
  style: 'Shirvanshah',
  description: 'A palace.',
  coordinates: { latitude: 40.37, longitude: 49.84 },
}

beforeEach(() => vi.clearAllMocks())

describe('getSavedRoutesForUser', () => {
  it('returns empty array when user has no routes', async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any)

    const result = await getSavedRoutesForUser('user1')

    expect(result).toEqual([])
  })

  it('returns resolved routes with joined monument data', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'route1',
          data: () => ({ userId: 'user1', name: 'My Route', monumentIds: ['mon1'] }),
        },
      ],
    } as any)

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'mon1',
      data: () => mockMonument,
    } as any)

    const result = await getSavedRoutesForUser('user1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('route1')
    expect(result[0].name).toBe('My Route')
    expect(result[0].stops).toHaveLength(1)
    expect(result[0].stops[0].monument.id).toBe('mon1')
    expect(result[0].stops[0].order).toBe(1)
  })

  it('assigns correct order to multiple stops', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'route1',
          data: () => ({ userId: 'user1', name: 'Tour', monumentIds: ['mon1', 'mon2'] }),
        },
      ],
    } as any)

    vi.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => true, id: 'mon1', data: () => mockMonument } as any)
      .mockResolvedValueOnce({ exists: () => true, id: 'mon2', data: () => ({ ...mockMonument, name: 'Tower' }) } as any)

    const result = await getSavedRoutesForUser('user1')
    const stops = result[0].stops

    expect(stops[0].order).toBe(1)
    expect(stops[1].order).toBe(2)
  })

  it('skips stops where the monument document does not exist', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'route1',
          data: () => ({ userId: 'user1', name: 'Tour', monumentIds: ['mon1', 'missing'] }),
        },
      ],
    } as any)

    vi.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => true, id: 'mon1', data: () => mockMonument } as any)
      .mockResolvedValueOnce({ exists: () => false } as any)

    const result = await getSavedRoutesForUser('user1')

    expect(result[0].stops).toHaveLength(1)
    expect(result[0].stops[0].monument.id).toBe('mon1')
  })
})
