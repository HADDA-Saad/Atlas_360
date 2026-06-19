import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/bookings/route';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockEq.mockReturnValue({ single: mockSingle, gte: mockGte });
    mockGte.mockReturnValue({ lte: mockLte });
    mockInsert.mockReturnValue({ select: mockSelect });
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

  it('400 — missing guide_id', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('guide_id is required');
  });

  it('400 — bad date format', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '06-01-2025', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('start_date is required in YYYY-MM-DD format');
  });

  it('400 — end before start', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-05', end_date: '2025-06-01' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('End date cannot be before start date');
  });

  it('404 — guide not found', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(404);
  });

  it('400 — guide not verified', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: { is_verified: false, daily_rate_mad: 500 }, error: null });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Guide is not verified');
  });

  it('409 — date conflict', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: { is_verified: true, daily_rate_mad: 500 }, error: null });
    mockLte.mockResolvedValueOnce({ data: [{ id: 'conflict-1' }], error: null });
    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe('Guide is not available on one or more of the selected dates');
  });

  it('201 — booking created', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
    mockSingle.mockResolvedValueOnce({ data: { is_verified: true, daily_rate_mad: 500 }, error: null });
    mockLte.mockResolvedValueOnce({ data: [], error: null });
    const mockBooking = { id: 'booking-1', total_price: 2500 };
    mockSingle.mockResolvedValueOnce({ data: mockBooking, error: null });

    const res = await POST(createRequest({ guide_id: 'guide-123', start_date: '2025-06-01', end_date: '2025-06-05' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(mockBooking);
  });
});
