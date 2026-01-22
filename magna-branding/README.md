# Magna Brand Guidelines

This folder contains the official Magna brand guidelines for the TSR Challenge game.

> **Source**: Magna Brand Center (brand.apps-magna.com)

## Quick Reference

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Ignition Red** | `#DA291C` | rgb(218, 41, 28) | Primary accent, CTAs (~4% of design) |
| **Carbon Black** | `#000000` | rgb(0, 0, 0) | Dominant color (~54% of design) |
| **Chrome White** | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark |
| **Cool Gray** | `#8B8B8D` | rgb(139, 139, 141) | Secondary elements (~14% of design) |

### Secondary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Electric Blue** | `#4299B4` | rgb(66, 153, 180) | Accent highlights, secondary emphasis |

### Color Balance Guide

Maintain this approximate balance across designs:

- **54%** Carbon Black (dominant)
- **24%** Chrome White
- **14%** Cool Gray
- **4%** Ignition Red (accent only - use sparingly!)

## Typography

### Primary Typography (Marketing/Digital Content)

| Usage | Font | Weight |
|-------|------|--------|
| Headlines | Helvetica Neue LT Pro 75 Bold | 700 |
| Subheads | Helvetica Neue LT Pro 45 Light | 300 |
| Copy Text | Helvetica Neue LT Pro 55 Roman | 400 |
| Highlighted Text | Helvetica Neue LT Pro 75 Bold | 700 |

### Digital Typography (Web/Internal)

For web applications without licensed Helvetica Neue:

| Usage | Font | Weight |
|-------|------|--------|
| Headlines | Arial Bold | 700 |
| Body Text | Arial | 400 |

**CSS Font Stack:**
```css
font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
```

### Typography Rules

- Headlines: Title-case only (never capitalize entire headline)
- Sublines: Sentence-case
- Never use italic or slanted text styles

## Logo

The Magna logo consists of:
1. **Stylized M** - The iconic "M" symbol with red dot
2. **MAGNA wordmark** - The company name in Cool Gray

### Logo Colors

| Element | Color |
|---------|-------|
| Stylized M | Carbon Black |
| Red Dot | Ignition Red |
| MAGNA text | Cool Gray |

### Logo Usage Rules

- Always maintain clear space around the logo (width of the stylized M)
- Never stretch, distort, or recolor the logo
- Use on white or Carbon Black backgrounds only
- For reverse (on black), use all-white logo

### Incorrect Usage

Do NOT:
- Use non-brand colors for the logo
- Mix colors incorrectly (red M, red text, etc.)
- Place on busy or low-contrast backgrounds

## Tagline

> **"Forward. For all."**

The tagline can be displayed:
- Stacked (two lines)
- Horizontal (one line)

Always maintain isolation area around the tagline.

## Chevron

The chevron is a distinctive diagonal design element that creates a sense of forward movement.

### Chevron Variants

1. Black / transparent chevron
2. Gray / transparent gray chevron
3. White / transparent white chevron
4. Red chevron
5. Outline chevron
6. Image chevron

### Usage Rules

- Chevron height should equal or exceed the height of your layout
- Top and bottom edges should never be visible
- Use to add visual interest and brand recognition

## Implementation

See the following files for implementation details:

- `tailwind.config.js` - Tailwind color configuration
- `src/index.css` - CSS variables and base styles
- `ui/DESIGN_TOKENS.md` - Design token reference

## Files

- `README.md` - This file
- `colors.md` - Detailed color specifications
- `typography.md` - Typography guidelines

## Compliance

All Magna-branded materials must comply with:
- Magna Visual Identity Guidelines
- Accessibility standards (WCAG 2.1 AA)
