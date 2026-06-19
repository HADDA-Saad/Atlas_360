import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/session/route';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

const { mockCreateSession } = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
}));
vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: mockCreateSession } };
  },
}));

describe('POST /api/checkout/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockCreateSession.mockResolvedValue({ url: 'https://stripe.com/pay/test', id: 'cs_test_123' });
  });

  const createRequest = (body: any) =>
    new Request('http://localhost/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  it('401 — not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(createRequest({ tier: 'nomad' }));
    expect(res.status).toBe(401);
  });

  it('400 — invalid tier', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    const res = await POST(createRequest({ tier: 'premium' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid tier requested.');
  });

  it('400 — bookingId not a string', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    const res = await POST(createRequest({ bookingId: 123 }));
    expect(res.status).toBe(400);
  });

  it('404 — booking not found', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const res = await POST(createRequest({ bookingId: 'b1' }));
    expect(res.status).toBe(404);
  });

  it('400 — booking not accepted yet', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockSingle.mockResolvedValueOnce({ data: { id: 'b1', status: 'pending' }, error: null });
    const res = await POST(createRequest({ bookingId: 'b1' }));
    expect(res.status).toBe(400);
  });

  it('returns stripe url for accepted booking', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockSingle.mockResolvedValueOnce({
      data: { id: 'b1', status: 'accepted', total_price: 500, start_date: '2025-06-01', end_date: '2025-06-03' },
      error: null
    });
    const res = await POST(createRequest({ bookingId: 'b1' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://stripe.com/pay/test');
  });

  it('returns stripe url for nomad tier', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'test@test.com' } } });
    mockSingle.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    const res = await POST(createRequest({ tier: 'nomad' }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe('https://stripe.com/pay/test');
  });

  it('returns stripe url for elite tier', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'test@test.com' } } });
    mockSingle.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    const res = await POST(createRequest({ tier: 'elite' }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe('https://stripe.com/pay/test');
  });

  it('returns stripe url for trip_pass', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'test@test.com' } } });
    mockSingle.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    const res = await POST(createRequest({ tier: 'trip_pass' }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe('https://stripe.com/pay/test');
  });
});
