# 🍸 Liquid Alchemy — Design System

This document defines the visual language for the Liquid Alchemy platform.
All team members should follow these guidelines to ensure a consistent UI across all pages.

---

## Visual Direction

The interface is inspired by:
- Premium minimalist product websites
- Cocktail menu editorial layouts
- Experimental visual storytelling

The design combines neutral background tones, serif display typography, restrained industrial color accents, and structured product cards.

---

## Color System

All colors are defined as CSS variables in `frontend/src/App.css`.

| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| Background | `--bg` | `#f6f5f1` | Page background |
| Panel | `--panel` | `#f1eee6` | Card / panel background |
| Panel Soft | `--panel-soft` | `#fbfaf6` | Light panel background |
| Text | `--text` | `#2f2c29` | Primary text |
| Muted | `--muted` | `#6e6a63` | Secondary / supporting text |
| Line | `--line` | `#d8d2c6` | Dividers and borders |
| Dark | `--dark` | `#2e2e2e` | Buttons and dark elements |
| Dark Hover | `--dark-hover` | `#1f1f1f` | Button hover state |
| Accent | `--accent` | `#b07a47` | Highlight color (copper gold) |
| Error | — | `#9c3d2b` | Error messages and delete actions |

### Usage Rules
- Always use CSS variables instead of hardcoded hex values
- Background should always be `--bg` or `--panel`
- Never use pure black (`#000`) or pure white (`#fff`) for text or backgrounds

---

## Typography

| Usage | Font | Size | Weight |
|-------|------|------|--------|
| Brand logo | Times New Roman, serif | 34px | 400 |
| Hero H1 | Times New Roman, serif | 60px | 500 |
| Section H2 | Times New Roman, serif | 42px | 500 |
| Product H3 | Times New Roman, serif | 24px | 500 |
| Body text | Inter, Helvetica Neue, Arial, sans-serif | 17–18px | 400 |
| Supporting text | Inter | 14–15px | 400 |
| Labels / eyebrow | Inter, uppercase, letter-spacing 2px | 12px | 400 |

### Usage Rules
- Use **Times New Roman** for all headings and display text
- Use **Inter** for all body text, labels, and UI elements
- Avoid bold weight — use 400 or 500 only
- Eyebrow labels should always be uppercase with letter-spacing

---

## Button System

| Type | Style | Usage |
|------|-------|-------|
| Primary | Dark background + white text, darker on hover | Main CTA (checkout, confirm) |
| Ghost | Transparent + dark border, fills dark on hover | Add to cart, secondary actions |
| Secondary | Transparent + light border | Continue shopping, cancel |
| Text Button | No border, red-brown color | Remove item, destructive actions |

### CSS Classes
```css
.checkout-button     /* Primary */
.ghost-button        /* Ghost */
.secondary-button    /* Secondary */
.text-button         /* Text */
```

---

## Spacing System

| Context | Value |
|---------|-------|
| Page padding (desktop) | `56px` |
| Page padding (tablet) | `24px` |
| Page padding (mobile) | `18px` |
| Section spacing | `54px` |
| Component gap | `40–48px` |
| Card inner padding | `18–20px` |
| Small gap | `8–14px` |

---

## Responsive Breakpoints

| Breakpoint | Layout Change |
|------------|---------------|
| > 1400px | Product grid: 4 columns |
| 1100–1400px | Product grid: 3 columns |
| 900–1100px | Hero and story sections stack vertically |
| < 900px | Header stacks vertically, padding reduces |
| < 560px | Product grid: 2 columns (compact), image height reduces |

---

## Component Patterns

### Product Card
- Image background: `#efe8dc`
- Image height: `360px` (desktop), `220px` (mobile)
- Title: Times New Roman, 24px
- Price: Inter, 18px
- Button: Ghost button, full width

### Section Dividers
- Use `border-bottom: 1px solid var(--line)` between all major sections
- Consistent `padding: 54px 0` for each section

### Cart Drawer
- Width: `390px` (desktop), `100%` (mobile)
- Background: `rgba(246, 245, 241, 0.92)` with `backdrop-filter: blur(12px)`
- Always use drawer overlay when cart is open

### Error States
- Background: `#f5dfd7`
- Text: `#9c3d2b`
- Border: `#e3bfb2`

---

## Do's and Don'ts

✅ Do
- Use CSS variables for all colors
- Use Times New Roman for headings
- Keep layouts minimal and well-spaced
- Follow the existing button classes

❌ Don't
- Use bright or saturated colors
- Use bold or heavy font weights
- Add drop shadows (except hero image)
- Use rounded corners on cards or buttons