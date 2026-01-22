# Design Tokens - Magna Brand

This document defines the CSS variables and Tailwind configuration for the Magna-branded TSR Challenge game.

> **Brand Source**: Magna Brand Center (brand.apps-magna.com)

## Magna Brand Colors

| Color | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Ignition Red | `#DA291C` | `magna-ignition-red` | Primary accent (~4%) |
| Carbon Black | `#000000` | `magna-carbon-black` | Dominant color (~54%) |
| Chrome White | `#FFFFFF` | `magna-chrome-white` | Backgrounds |
| Cool Gray | `#8B8B8D` | `magna-cool-gray` | Secondary (~14%) |
| Electric Blue | `#4299B4` | `magna-electric-blue` | Secondary accent |

## CSS Variables (in `src/index.css`)

```css
@layer base {
  :root {
    /* Light mode */
    --background: 0 0% 98%;
    --foreground: 0 0% 0%;
    
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;
    
    /* Ignition Red as primary - HSL: 4 83% 48% */
    --primary: 4 83% 48%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 0%;
    
    --muted: 0 0% 55%;
    --muted-foreground: 0 0% 45%;
    
    --accent: 4 83% 48%;
    --accent-foreground: 0 0% 100%;
    
    --destructive: 4 83% 48%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 0 0% 85%;
    --input: 0 0% 85%;
    --ring: 4 83% 48%;
    
    --radius: 0.5rem;
    
    /* Direct Magna hex values */
    --magna-ignition-red: #DA291C;
    --magna-carbon-black: #000000;
    --magna-chrome-white: #FFFFFF;
    --magna-cool-gray: #8B8B8D;
    --magna-electric-blue: #4299B4;
  }

  .dark {
    /* Dark mode - Carbon Black dominant */
    --background: 0 0% 7%;
    --foreground: 0 0% 95%;
    
    --card: 0 0% 10%;
    --card-foreground: 0 0% 95%;
    
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 95%;
    
    --primary: 4 83% 48%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 95%;
    
    --muted: 0 0% 55%;
    --muted-foreground: 0 0% 65%;
    
    --accent: 4 83% 48%;
    --accent-foreground: 0 0% 100%;
    
    --destructive: 4 83% 48%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 4 83% 48%;
  }
}
```

## Typography

### Font Stack

```css
/* Magna Primary Typography */
font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
```

### Font Weights

| Usage | Weight | Magna Equivalent |
|-------|--------|------------------|
| Headlines | 700 (Bold) | Helvetica Neue LT Pro 75 Bold |
| Subheads | 300 (Light) | Helvetica Neue LT Pro 45 Light |
| Body | 400 (Regular) | Helvetica Neue LT Pro 55 Roman |

### Tailwind Classes

```tsx
// Headlines
className="font-bold text-2xl"

// Subheads  
className="font-light text-lg"

// Body text
className="font-normal text-base"
```

## Status Colors

| Status | Tailwind Class | Notes |
|--------|----------------|-------|
| Success | `text-emerald-600` | Use for confirmations |
| Warning | `text-amber-500` | Use for cautions |
| Error | `text-magna-ignition-red` | Use Magna Red |
| Info | `text-magna-electric-blue` | Use Electric Blue |
| Neutral | `text-magna-cool-gray` | Use Cool Gray |

## Component Patterns

### Cards

```tsx
// Light mode card
className="rounded-xl border border-border bg-card p-6 shadow-sm"

// Dark mode card
className="rounded-xl bg-magna-dark border border-magna-gray/20 p-6"
```

### Buttons

```tsx
// Primary button (Ignition Red)
className="rounded-lg px-6 py-3 bg-magna-ignition-red text-white hover:bg-magna-red-dark font-bold transition-colors"

// Secondary button
className="rounded-lg px-6 py-3 bg-magna-cool-gray/20 text-foreground hover:bg-magna-cool-gray/30 transition-colors"

// Ghost button
className="rounded-lg px-6 py-3 text-magna-cool-gray hover:text-foreground transition-colors"
```

### Inputs

```tsx
className="rounded-lg border border-input bg-background px-4 py-2 focus:ring-2 focus:ring-magna-ignition-red/50"
```

### Badges

```tsx
// Accent badge
className="rounded-full px-3 py-1 text-xs font-medium bg-magna-ignition-red/10 text-magna-ignition-red"

// Neutral badge
className="rounded-full px-3 py-1 text-xs font-medium bg-magna-cool-gray/10 text-magna-cool-gray"
```

## Decorative Elements

### Chevron

The Magna chevron is a distinctive diagonal design element:

```tsx
// Add chevron decoration to a container
className="magna-chevron"

// Red variant
className="magna-chevron magna-chevron-red"
```

## Color Balance Reference

When designing screens, aim for this approximate color distribution:

| Color | Percentage | Usage |
|-------|------------|-------|
| Carbon Black | ~54% | Backgrounds, text |
| Chrome White | ~24% | Backgrounds, text on dark |
| Cool Gray | ~14% | Secondary elements, borders |
| Ignition Red | ~4% | Accents, CTAs (use sparingly!) |

## Accessibility

- Maintain WCAG 2.1 AA contrast ratios
- Ignition Red on white: 4.8:1 ✅
- White on Carbon Black: 21:1 ✅
- Cool Gray is for decorative use only (3.5:1 on white)
