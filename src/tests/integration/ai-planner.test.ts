import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai-itinerary/route'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()

// Admin client mocks
const mockAdminFrom = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

// Mock fetch globally
const mockGlobalFetch = vi.spyOn(globalThis, 'fetch')

describe('POST /api/ai-itinerary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-key'
    
    // Server client default mock chains
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    
    // Admin client default mock chains
    mockAdminFrom.mockReturnValue({ update: mockAdminUpdate })
    mockAdminUpdate.mockReturnValue({ eq: mockAdminEq })
    mockAdminEq.mockResolvedValue({ data: null, error: null })
  })

  const createRequest = (body: any) =>
    new Request('http://localhost/api/ai-itinerary', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

  it('401 — not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Auth error') })
    
    const res = await POST(createRequest({ prompt: 'Go to Marrakech' }))
    expect(res.status).toBe(401)
  })

  it('403 — limit exceeded on free explorer tier', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })
    mockSingle.mockResolvedValueOnce({
      data: { tier: 'explorer', ai_generations_count: 1 },
      error: null,
    })

    const res = await POST(createRequest({ prompt: 'Go to Marrakech' }))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('LIMIT_EXCEEDED')
    expect(json.message).toContain('limit of 1 free AI generation')
  })

  it('400 — missing prompt', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })
    mockSingle.mockResolvedValueOnce({
      data: { tier: 'explorer', ai_generations_count: 0 },
      error: null,
    })

    const res = await POST(createRequest({ prompt: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Prompt is required')
  })

  it('200 — generated successfully and increments count', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123', email: 'test@user.com' } } })
    
    // Custom mockFrom implementation for this test to handle multiple database queries
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { tier: 'explorer', ai_generations_count: 0 },
                error: null,
              })
            })
          })
        }
      }
      if (table === 'locations') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          })
        }
      }
      return { select: mockSelect }
    })

    // Mock Gemini API Response
    const mockGeminiJSON = {
      title: 'Morocco Highlights',
      description: 'A custom trip',
      stops: [
        {
          name: 'Bahia Palace',
          description: 'Beautiful palace',
          day_number: 1,
          order_index: 1,
          category: 'landmark',
          lat: 31.6211,
          lng: -7.9836
        }
      ]
    }

    mockGlobalFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockGeminiJSON)
                }
              ]
            }
          }
        ]
      })
    } as Response)

    const res = await POST(createRequest({ prompt: 'Go to Marrakech' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.itinerary).toEqual(mockGeminiJSON)
    expect(json.newGenerationsCount).toBe(1)

    // Verify database count was incremented via adminSupabase
    expect(mockAdminFrom).toHaveBeenCalledWith('profiles')
    expect(mockAdminUpdate).toHaveBeenCalledWith({ ai_generations_count: 1 })
    expect(mockAdminEq).toHaveBeenCalledWith('id', 'user-123')
  })
})
