# McKinsey Color Palette

This document defines the McKinsey brand colors for digital applications.

## Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| McKinsey Blue | `#007CBF` | rgb(0, 124, 191) | Primary brand color, buttons, links |
| McKinsey Dark Blue | `#004C7F` | rgb(0, 76, 127) | Headers, hover states, accents |
| White | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark |

## Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Light Blue | `#E6F3F9` | rgb(230, 243, 249) | Backgrounds, highlights |
| Medium Blue | `#3399CC` | rgb(51, 153, 204) | Secondary buttons, icons |

## Neutral Grays

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Black | `#000000` | rgb(0, 0, 0) | Headlines (sparingly) |
| Dark Gray | `#333333` | rgb(51, 51, 51) | Body text |
| Medium Gray | `#666666` | rgb(102, 102, 102) | Secondary text |
| Gray | `#999999` | rgb(153, 153, 153) | Disabled states |
| Light Gray | `#D1D1D1` | rgb(209, 209, 209) | Borders |
| Very Light Gray | `#F5F5F5` | rgb(245, 245, 245) | Backgrounds |

## Status Colors

For UI feedback and status indicators:

| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#059669` | Confirmations, success messages |
| Warning | `#CA8A04` | Warnings, attention needed |
| Error | `#DC2626` | Errors, destructive actions |
| Info | `#2563EB` | Informational messages |

## CSS Variables

Add these to your `src/index.css`:

```css
:root {
  /* McKinsey Brand Colors */
  --mck-blue: 199 100% 37%;
  --mck-dark-blue: 204 100% 25%;
  --mck-light-blue: 197 60% 94%;
  
  /* Grays */
  --mck-gray-100: 0 0% 96%;
  --mck-gray-300: 0 0% 82%;
  --mck-gray-600: 0 0% 40%;
  --mck-gray-900: 0 0% 20%;
  
  /* Map to semantic names */
  --primary: var(--mck-blue);
  --primary-foreground: 0 0% 100%;
}
```

## Tailwind Configuration

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        mck: {
          blue: {
            DEFAULT: '#007CBF',
            dark: '#004C7F',
            light: '#E6F3F9',
            medium: '#3399CC',
          },
          gray: {
            100: '#F5F5F5',
            300: '#D1D1D1',
            600: '#666666',
            900: '#333333',
          },
        },
      },
    },
  },
}
```

## Accessibility Notes

- Ensure sufficient contrast ratios (WCAG 2.1 AA minimum)
- McKinsey Blue (#007CBF) on white meets AA for large text
- Use Dark Blue (#004C7F) for better contrast on small text
- Always test with color contrast checkers

## Color Combinations

### Recommended Pairings

| Background | Text | Use Case |
|------------|------|----------|
| White | Dark Gray (#333) | Body content |
| White | McKinsey Blue | Links, CTAs |
| McKinsey Blue | White | Primary buttons |
| Dark Blue | White | Headers, footers |
| Light Blue | Dark Gray | Highlighted sections |
| Very Light Gray | Dark Gray | Cards, panels |

### Avoid

- McKinsey Blue text on Light Blue background (low contrast)
- Gray on gray combinations
- Red and green combinations (colorblindness)
