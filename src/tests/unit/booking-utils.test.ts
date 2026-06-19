import { describe, it, expect } from 'vitest';
import { calculateBookingPrice } from '@/lib/booking-utils';

describe('calculateBookingPrice', () => {
  it('same-day booking', () => {
    const result = calculateBookingPrice('2025-06-01', '2025-06-01', 500);
    expect(result.daysCount).toBe(1);
    expect(result.total_price).toBe(500);
    expect(result.commission_amount).toBe(50);
  });

  it('multi-day booking', () => {
    const result = calculateBookingPrice('2025-06-01', '2025-06-03', 500);
    expect(result.daysCount).toBe(3);
    expect(result.total_price).toBe(1500);
    expect(result.commission_amount).toBe(150);
  });

  it('rounds commission correctly', () => {
    const result = calculateBookingPrice('2025-06-01', '2025-06-01', 333);
    expect(result.daysCount).toBe(1);
    expect(result.total_price).toBe(333);
    expect(result.commission_amount).toBe(33); // 33.3 -> 33

    const result2 = calculateBookingPrice('2025-06-01', '2025-06-01', 335);
    expect(result2.commission_amount).toBe(34); // 33.5 -> 34
  });

  it('clamps to 1 day if end < start', () => {
    const result = calculateBookingPrice('2025-06-05', '2025-06-01', 500);
    expect(result.daysCount).toBe(1);
    expect(result.total_price).toBe(500);
    expect(result.commission_amount).toBe(50);
  });
});
