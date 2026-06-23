import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '@/app/api/guides/availability/route';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe('Guide Availability API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, delete: mockDelete });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockEq.mockReturnValue({ single: mockSingle, eq: mockEq2 });
    mockEq2.mockReturnValue({ single: mockSingle, eq: mockEq });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  const createRequest = (method: string, body?: any, url = 'http://localhost/api/guides/availability') =>
    new Request(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json' },
    });

  describe('POST', () => {
    it('401 — not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const res = await POST(createRequest('POST', { blocked_date: '2025-06-01' }));
      expect(res.status).toBe(401);
    });

    it('403 — user is not a guide', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockSingle.mockResolvedValueOnce({ data: null });
      const res = await POST(createRequest('POST', { blocked_date: '2025-06-01' }));
      expect(res.status).toBe(403);
    });

    it('400 — missing blocked_date', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockSingle.mockResolvedValueOnce({ data: { id: 'u1' } });
      const res = await POST(createRequest('POST', {}));
      expect(res.status).toBe(400);
    });

    it('400 — bad date format', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockSingle.mockResolvedValueOnce({ data: { id: 'u1' } });
      const res = await POST(createRequest('POST', { blocked_date: '2025/06/01' }));
      expect(res.status).toBe(400);
    });

    it('200 — date blocked', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockSingle.mockResolvedValueOnce({ data: { id: 'u1' } });
      const mockRecord = { id: 'avail-1', blocked_date: '2025-06-01' };
      mockSingle.mockResolvedValueOnce({ data: mockRecord, error: null });

      const res = await POST(createRequest('POST', { blocked_date: '2025-06-01' }));
      const json = await res.json();
      if (res.status === 500) console.log('POST ERROR:', json.error);
      expect(res.status).toBe(200);
      expect(json).toEqual(mockRecord);
    });
  });

  describe('DELETE', () => {
    it('401 — not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const res = await DELETE(createRequest('DELETE', undefined, 'http://localhost/api/guides/availability?id=123'));
      expect(res.status).toBe(401);
    });

    it('400 — missing id param', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      const res = await DELETE(createRequest('DELETE', undefined, 'http://localhost/api/guides/availability'));
      expect(res.status).toBe(400);
    });

    it('200 — date unblocked', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockEq2.mockResolvedValueOnce({ error: null });
      const res = await DELETE(createRequest('DELETE', undefined, 'http://localhost/api/guides/availability?id=123'));
      const json = await res.json();
      if (res.status === 500) console.log('DELETE ERROR:', json.error);
      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });
});
