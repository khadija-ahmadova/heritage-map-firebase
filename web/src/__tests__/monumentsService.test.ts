import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMonuments, getMonumentById } from '../services/monumentsService'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
}))

// Mock the firebase lib so no real app is initialised
vi.mock('../lib/firebase', () => ({ db: {} }))

import { getDocs, getDoc } from 'firebase/firestore'

const mockMonument = {
  name: 'Palace of the Shirvanshahs',
  location: 'Old City, Baku',
  period: '15th century',
  architect: 'Unknown',
  style: 'Shirvanshah',
  description: 'A palace complex.',
  coordinates: { latitude: 40.37, longitude: 49.84 },
}

function makeSnapshot(docs: { id: string; data: object }[]) {
  return {
    docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
  }
}

beforeEach(() => vi.clearAllMocks())

describe('getMonuments', () => {
  it('returns an array of monuments with ids', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([{ id: 'abc123', data: mockMonument }]) as any
    )

    const result = await getMonuments()

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 'abc123', ...mockMonument })
  })

  it('returns an empty array when the collection is empty', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot([]) as any)

    const result = await getMonuments()

    expect(result).toEqual([])
  })
})

describe('getMonumentById', () => {
  it('returns the monument when the document exists', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'abc123',
      data: () => mockMonument,
    } as any)

    const result = await getMonumentById('abc123')

    expect(result).toEqual({ id: 'abc123', ...mockMonument })
  })

  it('returns null when the document does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any)

    const result = await getMonumentById('nonexistent')

    expect(result).toBeNull()
  })
})
