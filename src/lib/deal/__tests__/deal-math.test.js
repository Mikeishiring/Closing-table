const { parseMoneyInput, LIMITS, formatNumber, clampTotal } = require('../deal-math');

describe('parseMoneyInput', () => {
  it('parses plain numbers and clamps to limits', () => {
    const { value } = parseMoneyInput('25,000');
    expect(value).toBe(LIMITS.TOTAL_MIN);

    const { value: high } = parseMoneyInput('9999999');
    expect(high).toBe(LIMITS.TOTAL_MAX);
  });

  it('supports k/m suffixes', () => {
    const { value: kVal } = parseMoneyInput('120k');
    expect(kVal).toBe(120000);

    const { value: mVal } = parseMoneyInput('0.2m');
    expect(mVal).toBe(200000);
  });

  it('returns formatted display', () => {
    const { display } = parseMoneyInput('50000');
    expect(display).toBe('50,000');
  });
});

describe('formatNumber', () => {
  it('formats with separators', () => {
    expect(formatNumber(120000)).toBe('120,000');
  });
});

describe('clampTotal', () => {
  it('clamps within min/max', () => {
    expect(clampTotal(1)).toBe(LIMITS.TOTAL_MIN);
    expect(clampTotal(999999)).toBe(LIMITS.TOTAL_MAX);
  });
});



