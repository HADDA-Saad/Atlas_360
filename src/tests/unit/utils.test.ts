import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('btn')).toBe('btn');
  });

  it('merges multiple class strings', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('ignores falsy values', () => {
    expect(cn('btn', false && 'btn-primary', null, undefined, 'active')).toBe('btn active');
  });

  it('last conflicting tailwind class wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('returns empty string with no args', () => {
    expect(cn()).toBe('');
  });
});
