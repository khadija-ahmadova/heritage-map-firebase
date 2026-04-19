import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getMonumentsByFilter,
  getUniqueFieldValues,
  searchMonuments,
} from '../services/filterService'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((_col, ...constraints) => ({ constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
}))

vi.mock('../lib/firebase', () => ({ db: {} }))

import { getDocs } from 'firebase/firestore'

function makeSnapshot(docs: { id: string; data: object }[]) {
  return {
    docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
  }
}

const monuments = [
  { id: '1', data: { name: 'Palace', architect: 'Ali', period: '15th', style: 'Medieval', location: 'Baku' } },
  { id: '2', data: { name: 'Tower',  architect: 'Ali', period: '12th', style: 'Gothic',   location: 'Ganja' } },
  { id: '3', data: { name: 'Gate',   architect: 'Veli', period: '15th', style: 'Medieval', location: 'Baku' } },
]

beforeEach(() => vi.clearAllMocks())

describe('getMonumentsByFilter', () => {
  it('returns all monuments when value is null', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot(monuments) as any)

    const result = await getMonumentsByFilter('location', null)

    expect(result).toHaveLength(3)
  })

  it('calls query with where constraint when value is provided', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([monuments[0]]) as any
    )

    const result = await getMonumentsByFilter('location', 'Baku')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})

describe('getUniqueFieldValues', () => {
  it('returns deduplicated non-empty values for a field', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot(monuments) as any)

    const periods = await getUniqueFieldValues('period')

    expect(periods).toEqual(expect.arrayContaining(['15th', '12th']))
    expect(periods).toHaveLength(2) // '15th' appears twice but deduped
  })

  it('returns unique architect values', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot(monuments) as any)

    const architects = await getUniqueFieldValues('architect')

    expect(architects).toEqual(expect.arrayContaining(['Ali', 'Veli']))
    expect(architects).toHaveLength(2)
  })
})

describe('searchMonuments', () => {
  it('returns empty array for empty query string', async () => {
    const result = await searchMonuments('')
    expect(result).toEqual([])
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('deduplicates monuments that match multiple fields', async () => {
    // Simulate the same monument appearing in two field queries
    vi.mocked(getDocs)
      .mockResolvedValueOnce(makeSnapshot([monuments[0]]) as any) // name match
      .mockResolvedValueOnce(makeSnapshot([monuments[0]]) as any) // architect match
      .mockResolvedValueOnce(makeSnapshot([]) as any)             // period match
      .mockResolvedValueOnce(makeSnapshot([]) as any)             // style match

    const result = await searchMonuments('Palace')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns results across multiple fields', async () => {
    vi.mocked(getDocs)
      .mockResolvedValueOnce(makeSnapshot([monuments[0]]) as any)
      .mockResolvedValueOnce(makeSnapshot([monuments[1], monuments[2]]) as any)
      .mockResolvedValueOnce(makeSnapshot([]) as any)
      .mockResolvedValueOnce(makeSnapshot([]) as any)

    const result = await searchMonuments('test')

    expect(result).toHaveLength(3)
  })
})
