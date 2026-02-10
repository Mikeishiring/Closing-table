# Design Bible - Closing Table Visual Style

## Overview

Closing Table follows a **clean, minimal, trust-first aesthetic** designed to make salary negotiation feel calm and fair. The design emphasizes clarity, neutrality, and quiet confidence — the opposite of aggressive, high-pressure UI.

---

## Core Principles

1. **Neutrality** - Neither side should feel advantaged by the interface
2. **Minimalism** - Less is more; whitespace is a feature
3. **Trust Through Simplicity** - Clean surfaces signal honesty and transparency
4. **One Action Per Screen** - Each view has one clear thing to do
5. **Privacy by Design** - Visual language reinforces "your number stays private"

---

## Color Palette

### Background
| Element | Color | Usage |
|---------|-------|-------|
| Page BG | `#f8fafc` | Primary background (slate-50) |
| Subtle gradient | `#f1f5f9` → `#ffffff` → `#f1f5f9` | Soft depth on shell |

### Surfaces
| Element | Color | Usage |
|---------|-------|-------|
| Card BG | `rgba(255,255,255,0.92)` | Frosted glass panels |
| Card BG strong | `rgba(255,255,255,0.96)` | Elevated surfaces |
| Card BG muted | `rgba(255,255,255,0.88)` | Secondary panels |

### Text
| Element | Color | Usage |
|---------|-------|-------|
| Primary | `#1e293b` | Headings, body text (slate-800) |
| Secondary | `#64748b` | Subtitles, labels (slate-500) |
| Tertiary | `#94a3b8` | Hints, placeholders (slate-400) |

### Accents
| Element | Color | Usage |
|---------|-------|-------|
| Company accent | `#3b82f6` | Primary actions, focus rings (blue-500) |
| Company strong | `#2563eb` | Hover states (blue-600) |
| Candidate accent | `#6c5ce7` | Candidate flow identity |
| Candidate hover | `#5b4ad6` | Candidate hover states |

### Result States
| Status | Color | Ring | Usage |
|--------|-------|------|-------|
| Success | `text-emerald-600` | `ring-emerald-100` | Deal closed |
| Close | `text-amber-600` | `ring-amber-100` | Within 10% |
| Fail | `text-rose-600` | `ring-rose-100` | No overlap |
| Pending | `text-slate-600` | `ring-slate-100` | Awaiting response |

---

## Surfaces & Cards

### Primary Card (Main Interaction Surface)

```
╭────────────────────────────────╮
│  Card Title                     │  ← 24-30px, font-weight 700
│  Subtitle text here             │  ← 15px, slate-500
│                                 │
│  ┌─────────────────────────┐   │
│  │  Input / Slider Area    │   │  ← Functional content
│  └─────────────────────────┘   │
│                                 │
│  [ CTA Button ]                │  ← Full-width, rounded-full
╰────────────────────────────────╯
```

### Properties
| Property | Value |
|----------|-------|
| Background | `rgba(255,255,255,0.92)` |
| Backdrop blur | `12px` |
| Border | `1px solid rgba(0,0,0,0.06)` |
| Border radius | `12px` |
| Shadow | `0 4px 20px rgba(0,0,0,0.06)` |
| Shadow (hover) | `0 8px 30px rgba(0,0,0,0.08)` |
| Padding | `24px` |
| Hover lift | `translateY(-1px)` |

### Anti-Patterns (Do NOT)
- Pseudo-element overlays (::before, ::after gradients)
- Inset shadows or inner glows
- Gradient card backgrounds
- Heavy drop shadows (> 0.1 opacity)
- Colored borders

---

## Secondary Info Panel

### Properties
| Property | Value |
|----------|-------|
| Background | `rgba(255,255,255,0.92)` |
| Backdrop blur | `12px` |
| Border | `1px solid rgba(0,0,0,0.06)` |
| Border radius | `12px` |
| Shadow | `0 4px 20px rgba(0,0,0,0.06)` |
| Width | `220-280px` |
| Icon BG | `rgba(59,130,246,0.08)` |
| Icon color | `#3b82f6` (blue-500) |

### Title Style
```css
font-size: 0.65rem;
font-weight: 500;
letter-spacing: 0.1em;
text-transform: uppercase;
color: #64748b;
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Hierarchy

| Element | Size | Weight | Color | Extra |
|---------|------|--------|-------|-------|
| Brand name | clamp(28px, 4vw, 42px) | 700 | `#1e293b` | No gradient, no glow |
| Card title | clamp(24px, 1.6vw+18px, 30px) | 700 | `#1e293b` | letter-spacing: -0.02em |
| Card subtitle | 15px | 400 | `#64748b` | — |
| Panel title | 0.65rem | 500 | `#64748b` | UPPERCASE, 0.1em tracking |
| Body text | 0.9rem | 400 | `#64748b` | — |
| Input text | 24px | 500 | `#1e293b` | — |
| Money display | clamp(38px, 3vw+16px, 54px) | 700 | `#1e293b` | letter-spacing: -0.02em |
| Hint/privacy | 12px | 400 | `#94a3b8` | — |
| CTA label | 16px | 500 | `#1e293b` | — |

### Anti-Patterns (Do NOT)
- Gradient text fills (`-webkit-background-clip: text`)
- Font-weight 800 (max 700)
- Decorative drop-shadow on text
- Animated text color/gradient

---

## Inputs & Controls

### Currency Input
| Property | Value |
|----------|-------|
| Height | 56px |
| Border radius | 12px |
| Border | `1px solid rgba(0,0,0,0.06)` |
| Border (focus) | `1px solid #3b82f6` |
| Focus ring | `0 0 0 3px rgba(59,130,246,0.12)` |
| Background | `#ffffff` |
| Placeholder color | `#94a3b8` (slate-400) |

### Slider
| Property | Value |
|----------|-------|
| Track height | 6px |
| Track color | `#e2e8f0` (slate-200) |
| Fill gradient | `#3b82f6` → `#6366f1` → `#8b5cf6` |
| Thumb size | 24px |
| Thumb border | `1px solid var(--accent-primary)` |
| Snap tick color | `#3b82f6` (active), `rgba(59,130,246,0.4)` (passed), `rgba(148,163,184,0.4)` (upcoming) |

### Slide-to-Confirm
| Property | Value |
|----------|-------|
| Track height | 56px |
| Track border radius | 999px |
| Track border | `1px solid rgba(0,0,0,0.06)` |
| Track background | `#ffffff` |
| Track shadow | `0 2px 12px rgba(0,0,0,0.04)` |
| Handle size | 44px circle |
| Handle border | `1px solid rgba(0,0,0,0.08)` |
| Handle shadow | `0 4px 20px rgba(0,0,0,0.06)` |
| Fill gradient | Same as slider fill, opacity 0.2 |

---

## Buttons

### Primary (Dark)
```
bg-slate-900 text-white rounded-full py-3 text-sm font-semibold
```
- Hover: `bg-slate-800`
- Active: `scale(0.98)`
- Focus: `ring-2 ring-slate-900 ring-offset-2`

### Secondary (Outlined)
```
border border-slate-200 text-slate-700 rounded-full py-3 text-sm
```
- Hover: `bg-slate-50`

---

## Animation & Motion

### Guiding Principle
**Slow, organic, calming** - like signing a contract, not swiping a dating app

### Durations
| Animation | Duration | Easing |
|-----------|----------|--------|
| Fade in | 400ms | ease |
| Card entrance | 400ms | ease |
| Emoji pop | 300ms | ease |
| Number breathe | 500ms | ease-in-out |
| Slide down | 300ms | ease |
| Hover lift | 200ms | ease |
| Focus ring | 160ms | ease |

### Card Entrance
- `translateY(8px)` → `translateY(0)` with fade
- No scale transform (subtle Y-shift only)
- No rotation

### Result Reveal Sequence
1. **Computing** (1.5s): Slot-machine number shuffle
2. **Emoji** (0.2s): Scale 0.8 → 1.0 pop
3. **Details** (0.3s): Fade + slide from below
4. **Confetti** (success only): 90 particles, spread 70

### Haptic Feedback (Mobile)
- Milestone crossing ($50k increments): medium pulse
- Snap point entry: milestone pulse
- Boundary hit (min/max): light tap
- Release near snap: confirmation snap

### Anti-Patterns (Do NOT)
- Aurora/glow background animations
- Shimmer effects on cards
- Gradient shifts or color cycling
- Scale transforms > 1.1x
- Rotation on non-emoji elements
- Aggressive spring physics

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 4px 20px rgba(0,0,0,0.06)` | Cards, panels |
| `--shadow-soft` | `0 2px 12px rgba(0,0,0,0.04)` | Inputs, mini widgets |
| Card hover | `0 8px 30px rgba(0,0,0,0.08)` | Elevated state |
| Focus ring | `0 0 0 3px rgba(59,130,246,0.12)` | Input focus |

### Anti-Patterns (Do NOT)
- Multi-layer shadows (no stacking 3+ shadows)
- Colored shadows (no purple/blue shadow tints)
- Inset shadows
- Shadow opacity > 0.1

---

## Borders & Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | `rgba(0,0,0,0.06)` | Default borders |
| `--border-strong` | `rgba(0,0,0,0.1)` | Hover borders |
| `--radius-card` | `12px` | Cards, panels, inputs |
| `--radius-chip` | `8px` | Chips, badges, privacy note |
| `--radius-pill` | `999px` | Buttons, slider track |

---

## Layout

### Page Structure
```
┌─────────────────────────────────────────┐
│            Closing Table (brand)         │  ← Centered, absolute top
│                                          │
│  ┌─────────────────────┐ ┌──────────┐  │
│  │                     │ │ Secondary │  │
│  │   Primary Card      │ │ Info     │  │  ← Grid on desktop
│  │   (main action)     │ │ Panel    │  │
│  │                     │ └──────────┘  │
│  └─────────────────────┘               │
│                                          │
│         🔒 Privacy note                 │  ← Centered below
└─────────────────────────────────────────┘
```

### Grid
- Desktop (960px+): `1.65fr 220-280px` two-column
- Mobile: Single column, stacked

### Spacing Scale
| Token | Value |
|-------|-------|
| `--space-1` | 6px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-7` | 28px |
| `--space-8` | 32px |

---

## Accessibility

- **Focus rings**: `0 0 0 3px rgba(59,130,246,0.3)` on all interactive elements
- **Reduced motion**: All animations collapse to instant via `prefers-reduced-motion`
- **ARIA labels**: Slider, slide-to-confirm, inputs all labeled
- **Keyboard**: Slide-to-confirm accepts Enter/Space
- **Haptics**: Respects system haptic settings
- **Selection color**: `rgba(59,130,246,0.15)` with dark text

---

## Do's and Don'ts

### DO
- Keep it clean and minimal
- Use whitespace generously
- Let the numbers be the focal point
- Animate slowly and smoothly
- Use the slate palette for all neutral tones
- Make inputs feel premium and intentional

### DON'T
- Add dark themes or aurora gradients
- Use glows, shimmer, or particle effects
- Animate aggressively (no bounce, no wobble)
- Add gradient text or rainbow effects
- Stack multiple shadow layers
- Use colored borders
- Add decorative pseudo-elements

---

## Reference Aesthetic

The visual style draws from:
- Banking and fintech apps (clean, trustworthy)
- Legal document signing (Docusign's calm neutrality)
- Social Graph DESIGN_BIBLE (shared palette, panels, typography)
- Minimalist data visualization (Observable, Linear)

The feeling should be:
- Professional and polished
- Calm and neutral
- Trustworthy
- Like signing something important

---

*Last updated: 2026-02-10*
