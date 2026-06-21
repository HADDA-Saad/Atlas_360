import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';

const { mockConstructEvent, mockSetPaid, mockUpdate, mockEq } = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockSetPaid: vi.fn().mockResolvedValue(undefined),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mockConstructEvent };
  },
}));

vi.mock('@/lib/setPaid', () => ({
  setPaid: mockSetPaid,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ update: mockUpdate })),
  })),
}));

function createRequest(signature: string | null, body: any) {
  const headers = new Headers();
  if (signature) headers.set('stripe-signature', signature);
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('Stripe Webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetPaid.mockResolvedValue(undefined);
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('400 — missing signature', async () => {
    const res = await POST(createRequest(null, {}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('No signature found');
  });

  it('400 — bad signature', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });
    const res = await POST(createRequest('invalid-sig', {}));
    expect(res.status).toBe(400);
  });

  it('calls setPaid on checkout.session.completed for a booking', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: { object: { metadata: { bookingId: 'booking-123' } } },
    };
    mockConstructEvent.mockReturnValueOnce(mockEvent);

    const res = await POST(createRequest('valid-sig', mockEvent));
    expect(res.status).toBe(200);
    expect(mockSetPaid).toHaveBeenCalledWith('booking-123');
  });
});
