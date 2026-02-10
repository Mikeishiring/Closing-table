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
    const strings = collectStrings(copy).filter((s) => s.trim().length > 0);
    expect(strings.length).toBeGreaterThan(0);
    strings.forEach((str) => {
      expect(str.toLowerCase()).not.toContain('todo');
    });
  });

  it('defines CTA labels for both company and candidate flows', () => {
    expect(copy.company.form.cta).toBeTruthy();
    expect(copy.candidate.cta).toBeTruthy();
    expect(copy.company.form.fallbackCta).toBeTruthy();
    expect(copy.candidate.fallbackCta).toBeTruthy();
  });

  it('keeps result statuses as a subset of configuration tokens', () => {
    const copyStatuses = Object.keys(copy.result.statuses).sort();
    const configuredStatuses = Object.keys(RESULT_CONFIG).sort();
    // Every copy status should exist in config
    copyStatuses.forEach((status) => {
      expect(configuredStatuses).toContain(status);
    });
  });

  it('includes required fields for every result status', () => {
    const allowedAccents = ['emerald', 'amber', 'rose'];

    Object.values(copy.result.statuses).forEach((status) => {
      expect(status.title).toBeTruthy();
      expect(status.subtitle).toBeTruthy();
      expect(status.line).toBeTruthy();
      expect(status.label).toBeTruthy();
      expect(allowedAccents).toContain(status.accent);
    });
  });

  it('renders validation copy with provided bounds', () => {
    const min = '50k';
    const max = '150k';
    const message = copy.validation.minMaxRange(min, max);
    expect(message).toContain(min);
    expect(message).toContain(max);
  });
});
