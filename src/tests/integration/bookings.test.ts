import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/bookings/route';

// ── Server client mocks ──────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockInsert = vi.fn();
const mockIn = vi.fn();
// End of active-booking-conflict chain: .eq().in().lte().gte()
const mockGteActive = vi.fn();

// ── Admin client mocks (createAdminClient used for insert + notifications) ───
const mockAdminFrom = vi.fn();
const mockAdminInsert = vi.fn();
const mockAdminSelect = vi.fn();
const mockAdminSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Server client chain
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockEq.mockReturnValue({ single: mockSingle, gte: mockGte, in: mockIn });
    mockGte.mockReturnValue({ lte: mockLte });                   // availability chain: .gte().lte()
    mockIn.mockReturnValue({ lte: mockLte });                    // active-conflict chain: .in().lte()
    mockLte.mockReturnValue({ gte: mockGteActive });             // active-conflict chain: .lte().gte()
    mockGteActive.mockResolvedValue({ data: [], error: null });  // default: no active conflicts
    mockInsert.mockReturnValue({ select: mockSelect });

    // Admin client chain
    mockAdminFrom.mockReturnValue({ insert: mockAdminInsert });
    mockAdminInsert.mockReturnValue({ select: mockAdminSelect });
    mockAdminSelect.mockReturnValue({ single: mockAdminSingle });
    mockAdminSingle.mockResolvedValue({ data: null, error: null });
  });

  const createRequest = (body: any) =>
    new Request('http://localhost/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  it('401 — not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(createRequest({}));
    expect(res.status).toBe(401);
  });

  it('400 — terms_agreed not provided', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('You must agree to the cancellation policy to book.');
  });

  it('400 — missing guide_id', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ terms_agreed: true, start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('guide_id is required');
  });

  it('400 — bad date format', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '06-01-2025', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('start_date is required in YYYY-MM-DD format');
  });

  it('400 — end before start', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '2025-06-05', end_date: '2025-06-01' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('End date cannot be before start date');
  });

  it('404 — guide not found', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(404);
  });

  it('400 — guide not verified', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: { is_verified: false, daily_rate_mad: 500 }, error: null });
    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Guide is not verified');
  });

  it('409 — date conflict', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: { is_verified: true, daily_rate_mad: 500 }, error: null });
    // Availability check (.gte().lte()) — first call to mockLte resolves with a conflict
    mockLte.mockResolvedValueOnce({ data: [{ id: 'conflict-1' }], error: null });
    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe('Guide is not available on one or more of the selected dates');
  });

  it('201 — booking created', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123', email: 'traveler@test.com' } } });
    // Guide lookup
    mockSingle.mockResolvedValueOnce({ data: { is_verified: true, daily_rate_mad: 500 }, error: null });
    // Availability check (.gte().lte()) — first call to mockLte: no blocked dates
    mockLte.mockResolvedValueOnce({ data: [], error: null });
    // Active-booking conflict check (.in().lte().gte()) — mockGteActive default: { data: [], error: null }
    // Insert result
    const mockBooking = { id: 'booking-1', total_price: 2500 };
    mockAdminSingle.mockResolvedValueOnce({ data: mockBooking, error: null });

    const res = await POST(createRequest({ terms_agreed: true, guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(mockBooking);
  });
});
