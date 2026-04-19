import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadToCloudinary } from '../lib/cloudinary'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => vi.clearAllMocks())

describe('uploadToCloudinary', () => {
  it('returns the secure_url on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: 'https://cdn.cloudinary.com/img.jpg' }),
    })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const url = await uploadToCloudinary(file)

    expect(url).toBe('https://cdn.cloudinary.com/img.jpg')
  })

  it('calls fetch with POST method', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: 'https://cdn.cloudinary.com/img.jpg' }),
    })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await uploadToCloudinary(file)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
  })

  it('throws when the upload fails', async () => {
    mockFetch.mockResolvedValue({ ok: false })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(uploadToCloudinary(file)).rejects.toThrow('Cloudinary upload failed')
  })
})
