import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';

// hoisted so mocks are available before vi.mock() factories execute
const { mockConstructEvent, mockUpdate, mockEq } = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mockConstructEvent };
  },
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

  it('marks booking as paid on checkout.session.completed', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: { object: { metadata: { bookingId: 'booking-123' } } },
    };
    mockConstructEvent.mockReturnValueOnce(mockEvent);

    const res = await POST(createRequest('valid-sig', mockEvent));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'paid' });
    expect(mockEq).toHaveBeenCalledWith('id', 'booking-123');
  });

  it('activates trip pass on one-time payment', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'payment',
          client_reference_id: 'user-456',
          customer: 'cus_789',
          metadata: { tier: 'trip_pass' },
        },
      },
    };
    mockConstructEvent.mockReturnValueOnce(mockEvent);

    const res = await POST(createRequest('valid-sig', mockEvent));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      tier: 'trip_pass',
      subscription_status: 'active',
      stripe_customer_id: 'cus_789'
    }));
    expect(mockEq).toHaveBeenCalledWith('id', 'user-456');
  });
});
