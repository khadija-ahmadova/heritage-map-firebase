import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  submitContribution,
  getPendingContributions,
  updateContributionStatus,
  getApprovedContributions,
  getMonumentPhotos,
  getMyMonumentSubmissions,
  getMyTextContributions,
  getPendingMonumentSubmissions,
  updateMonumentSubmissionStatus,
  submitNewMonument,
} from '../services/contributionsService'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  collectionGroup: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  GeoPoint: class { constructor(public latitude: number, public longitude: number) {} },
}))

vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('../lib/cloudinary', () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue('https://cdn.example.com/img.jpg'),
}))

import { addDoc, getDocs, updateDoc } from 'firebase/firestore'

function makeSnapshot(docs: { id: string; data: object }[]) {
  return {
    empty: docs.length === 0,
    docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
  }
}

beforeEach(() => vi.clearAllMocks())

// ── submitContribution ───────────────────────────────────────────────────────

describe('submitContribution', () => {
  it('calls addDoc with correct fields', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'c1' } as any)

    await submitContribution('mon1', 'user1', 'Great info')

    expect(addDoc).toHaveBeenCalledOnce()
    const [, payload] = vi.mocked(addDoc).mock.calls[0]
    expect(payload).toMatchObject({
      monument_id: 'mon1',
      author_uid: 'user1',
      information: 'Great info',
      status: 'pending',
    })
  })
})

// ── getPendingContributions ──────────────────────────────────────────────────

describe('getPendingContributions', () => {
  it('returns mapped contributions', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'c1', data: { monument_id: 'm1', author_uid: 'u1', information: 'text', status: 'pending', submitted_at: null } },
      ]) as any
    )

    const result = await getPendingContributions()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'c1', status: 'pending' })
  })

  it('returns empty array when no pending contributions', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot([]) as any)
    expect(await getPendingContributions()).toEqual([])
  })
})

// ── updateContributionStatus ─────────────────────────────────────────────────

describe('updateContributionStatus', () => {
  it('calls updateDoc with the new status', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    await updateContributionStatus('mon1', 'c1', 'approved')

    expect(updateDoc).toHaveBeenCalledOnce()
    const [, payload] = vi.mocked(updateDoc).mock.calls[0]
    expect(payload).toEqual({ status: 'approved' })
  })
})

// ── getApprovedContributions ─────────────────────────────────────────────────

describe('getApprovedContributions', () => {
  it('returns approved contributions for a monument', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'c2', data: { status: 'approved', information: 'Great', author_uid: 'u1', monument_id: 'm1', submitted_at: null } },
      ]) as any
    )

    const result = await getApprovedContributions('mon1')

    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('approved')
  })
})

// ── getMonumentPhotos ────────────────────────────────────────────────────────

describe('getMonumentPhotos', () => {
  it('returns photos for a monument', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'p1', data: { uploader_uid: 'u1', image_url: 'https://img.jpg', uploaded_at: null } },
      ]) as any
    )

    const result = await getMonumentPhotos('mon1')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'p1', image_url: 'https://img.jpg' })
  })
})

// ── getMyMonumentSubmissions ─────────────────────────────────────────────────

describe('getMyMonumentSubmissions', () => {
  it('returns monuments submitted by the user', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'm1', data: { name: 'Tower', author_uid: 'u1', submission_status: 'pending' } },
      ]) as any
    )

    const result = await getMyMonumentSubmissions('u1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('m1')
  })
})

// ── getMyTextContributions ───────────────────────────────────────────────────

describe('getMyTextContributions', () => {
  it('returns text contributions by the user', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'c1', data: { author_uid: 'u1', information: 'text', status: 'pending', monument_id: 'm1', submitted_at: null } },
      ]) as any
    )

    const result = await getMyTextContributions('u1')

    expect(result).toHaveLength(1)
    expect(result[0].author_uid).toBe('u1')
  })
})

// ── getPendingMonumentSubmissions ────────────────────────────────────────────

describe('getPendingMonumentSubmissions', () => {
  it('returns pending monument submissions', async () => {
    vi.mocked(getDocs).mockResolvedValue(
      makeSnapshot([
        { id: 'm2', data: { name: 'Gate', submission_status: 'pending' } },
      ]) as any
    )

    const result = await getPendingMonumentSubmissions()

    expect(result[0].id).toBe('m2')
  })
})

// ── updateMonumentSubmissionStatus ──────────────────────────────────────────

describe('updateMonumentSubmissionStatus', () => {
  it('sets published true when approved', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    await updateMonumentSubmissionStatus('mon1', 'approved')

    const [, payload] = vi.mocked(updateDoc).mock.calls[0]
    expect(payload).toEqual({ submission_status: 'approved', published: true })
  })

  it('sets published false when rejected', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    await updateMonumentSubmissionStatus('mon1', 'rejected')

    const [, payload] = vi.mocked(updateDoc).mock.calls[0]
    expect(payload).toEqual({ submission_status: 'rejected', published: false })
  })
})

// ── submitNewMonument ────────────────────────────────────────────────────────

describe('submitNewMonument', () => {
  it('returns the new document id', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'newMon' } as any)

    const id = await submitNewMonument(
      { name: 'Palace', architect: 'Ali', location: 'Baku', period: '15th', style: 'Medieval', description: 'Desc' },
      'user1'
    )

    expect(id).toBe('newMon')
  })

  it('includes GeoPoint when lat/lng provided', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'newMon' } as any)

    await submitNewMonument(
      { name: 'Tower', architect: 'Veli', location: 'Ganja', period: '12th', style: 'Gothic', description: 'Desc', lat: 40.5, lng: 49.9 },
      'user1'
    )

    const [, payload] = vi.mocked(addDoc).mock.calls[0]
    expect(payload).toHaveProperty('coordinates')
  })

  it('omits coordinates when lat/lng not provided', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'newMon' } as any)

    await submitNewMonument(
      { name: 'Gate', architect: 'X', location: 'Baku', period: '10th', style: 'Stone', description: 'Desc' },
      'user1'
    )

    const [, payload] = vi.mocked(addDoc).mock.calls[0]
    expect(payload).not.toHaveProperty('coordinates')
  })
})
