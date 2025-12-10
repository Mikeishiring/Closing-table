const fs = require('fs');
const path = require('path');

const tokensCss = fs.readFileSync(path.join(__dirname, '../design-tokens.css'), 'utf8');

const parseTokens = (css) => {
  const rootBlock = css.match(/:root\s*{([\s\S]*?)}/);
  if (!rootBlock) {
    throw new Error('No :root block found in design-tokens.css');
  }

  const tokens = {};
  rootBlock[1]
    .split('\n')
    .map((line) => line.trim())
    .forEach((line) => {
      const match = line.match(/--([a-z0-9-]+):\s*([^;]+);/i);
      if (match) {
        tokens[`--${match[1]}`] = match[2].trim();
      }
    });

  return tokens;
};

describe('design tokens', () => {
  const tokens = parseTokens(tokensCss);

  it('extracts non-empty tokens from the :root block', () => {
    expect(Object.keys(tokens).length).toBeGreaterThan(10);
    Object.entries(tokens).forEach(([name, value]) => {
      expect(name.startsWith('--')).toBe(true);
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('keeps surface and text palette stable', () => {
    expect(tokens['--bg-page']).toBe('#050814');
    expect(tokens['--bg-card']).toBe('rgba(255, 255, 255, 0.82)');
    expect(tokens['--text-primary']).toBe('#0b0b0f');
    expect(tokens['--text-secondary']).toBe('#3c3c43');
  });

  it('defines consistent accent and state colors', () => {
    ['--accent-primary', '--accent-primary-strong', '--accent-candidate', '--accent-candidate-hover'].forEach((key) => {
      expect(tokens[key]).toMatch(/^#/);
    });
    expect(tokens['--success-color']).toMatch(/^#/);
    expect(tokens['--error-color']).toMatch(/^#/);
  });

  it('maintains an ascending spacing scale', () => {
    const spacingKeys = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--space-8'];
    spacingKeys.forEach((key) => expect(tokens[key]).toBeDefined());
    const spacingValues = spacingKeys.map((key) => parseInt(tokens[key], 10));
    expect(spacingValues).toEqual([6, 8, 12, 16, 20, 24, 28, 32]);
  });

  it('keeps slider affordances defined', () => {
    expect(tokens['--slider-track']).toBe('#e4e6ef');
    expect(tokens['--slider-fill']).toMatch(/linear-gradient/i);
    expect(tokens['--slider-thumb']).toBe('#ffffff');
  });

  it('includes aurora accent set for visual flares', () => {
    const auroraKeys = ['--aurora-1', '--aurora-2', '--aurora-3', '--aurora-4'];
    auroraKeys.forEach((key) => {
      expect(tokens[key]).toMatch(/^#|^rgb/i);
    });
  });
});

