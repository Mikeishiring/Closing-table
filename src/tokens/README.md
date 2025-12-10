# Tokens

Shared UX language and design primitives:
- `copy.ts`: UI strings and validation copy.
- `config.js`: Behavioural constants (limits, expiries, result copy).
- `design-tokens.css`: Global design tokens for surfaces, text, spacing, and accents.

Import from the barrel where possible:
```js
import { copy, PRIVACY_COPY, RESULT_CONFIG, EXPIRY, DEAL_LIMITS } from '../tokens';
```

