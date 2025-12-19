import { copy } from '../copy';
import { RESULT_CONFIG } from '../config';

const collectStrings = (value, acc = []) => {
  if (typeof value === 'string') {
    acc.push(value);
    return acc;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, acc));
    return acc;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((val) => collectStrings(val, acc));
  }

  return acc;
};

describe('copy tokens', () => {
  it('defines non-empty shared strings to keep UX messaging intact', () => {
    const strings = collectStrings(copy);
    expect(strings.length).toBeGreaterThan(0);
    strings.forEach((str) => {
      expect(str.trim().length).toBeGreaterThan(0);
      expect(str.toLowerCase()).not.toContain('todo');
    });
  });

  it('keeps CTA labels aligned between company and candidate flows', () => {
    expect(copy.company.form.cta).toBe(copy.candidate.cta);
    expect(copy.company.form.fallbackCta).toBe(copy.candidate.fallbackCta);
  });

  it('keeps result statuses in sync with configuration tokens', () => {
    const copyStatuses = Object.keys(copy.result.statuses).sort();
    const configuredStatuses = Object.keys(RESULT_CONFIG).sort();
    expect(copyStatuses).toEqual(configuredStatuses);
  });

  it('includes actionable details and next steps for every status', () => {
    const allowedAccents = ['emerald', 'amber', 'rose'];

    Object.values(copy.result.statuses).forEach((status) => {
      expect(status.title).toBeTruthy();
      expect(status.subtitle).toBeTruthy();
      expect(status.line).toBeTruthy();
      expect(status.label).toBeTruthy();
      expect(allowedAccents).toContain(status.accent);

      expect(Array.isArray(status.details)).toBe(true);
      expect(status.details.length).toBeGreaterThan(0);
      expect(status.details.every((item) => typeof item === 'string' && item.length > 0)).toBe(true);

      expect(Array.isArray(status.nextSteps)).toBe(true);
      expect(status.nextSteps.length).toBeGreaterThan(0);
      expect(status.nextSteps.every((item) => typeof item === 'string' && item.length > 0)).toBe(true);
    });
  });

  it('renders validation copy with provided bounds', () => {
    const min = '50k';
    const max = '150k';
    const message = copy.validation.minMaxRange(min, max);
    expect(message).toContain(min);
    expect(message).toContain(max);
    expect(message.toLowerCase()).toContain('minimum');
  });
});



