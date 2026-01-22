# Magna Color Palette

Official color specifications from the Magna Brand Center.

## Primary Colors

### Ignition Red
The signature Magna accent color. Use sparingly for maximum impact.

| Format | Value |
|--------|-------|
| Hex | `#DA291C` |
| RGB | 218, 41, 28 |
| CMYK | 0, 95, 100, 0 |
| HSL | 4, 83%, 48% |

**Usage:**
- Primary CTAs and buttons
- Accent highlights
- The dot in the Magna logo
- ~4% of overall design

---

### Carbon Black
The dominant color in Magna's visual identity.

| Format | Value |
|--------|-------|
| Hex | `#000000` |
| RGB | 0, 0, 0 |
| CMYK | 30, 30, 30, 100 |
| HSL | 0, 0%, 0% |

**Usage:**
- Primary backgrounds (dark mode)
- Headlines and body text
- The stylized M in the logo
- ~54% of overall design

---

### Chrome White
Clean, crisp white for backgrounds and contrast.

| Format | Value |
|--------|-------|
| Hex | `#FFFFFF` |
| RGB | 255, 255, 255 |
| CMYK | 0, 0, 0, 0 |
| HSL | 0, 0%, 100% |

**Usage:**
- Primary backgrounds (light mode)
- Text on dark backgrounds
- ~24% of overall design

---

### Cool Gray
Secondary color for supporting elements.

| Format | Value |
|--------|-------|
| Hex | `#8B8B8D` |
| RGB | 139, 139, 141 |
| CMYK | 23, 16, 13, 46 |
| HSL | 240, 1%, 55% |

**Usage:**
- Secondary text
- Borders and dividers
- The MAGNA wordmark
- ~14% of overall design

---

## Secondary Colors

### Electric Blue
Complementary accent for additional emphasis.

| Format | Value |
|--------|-------|
| Hex | `#4299B4` |
| RGB | 66, 153, 180 |
| CMYK | 72, 0, 0, 12 |
| HSL | 194, 46%, 48% |

**Usage:**
- Secondary highlights
- Info states
- Links (alternative to red)
- Use sparingly, for accent purposes only

---

## Extended Grays

For UI elements requiring additional gray tones:

| Name | Hex | Usage |
|------|-----|-------|
| Gray 100 | `#F5F5F5` | Light backgrounds |
| Gray 300 | `#D4D4D4` | Borders, dividers |
| Gray 600 | `#666666` | Secondary text |
| Gray 900 | `#333333` | Dark text |

---

## Color Balance

Magna maintains specific color proportions for brand consistency:

```
┌────────────────────────────────────────────────────────┐
│ Carbon Black (54%)                                     │
├─────────────────────────┬──────────────┬──────┬───────│
│                         │ Cool Gray    │ White│ Red   │
│                         │ (14%)        │(24%) │ (4%)  │
└─────────────────────────┴──────────────┴──────┴───────┘
```

---

## CSS Variables

```css
:root {
  --magna-ignition-red: #DA291C;
  --magna-carbon-black: #000000;
  --magna-chrome-white: #FFFFFF;
  --magna-cool-gray: #8B8B8D;
  --magna-electric-blue: #4299B4;
}
```

---

## Tailwind Classes

```jsx
// Primary accent (Ignition Red)
className="bg-magna-ignition-red text-white"

// Dark background
className="bg-magna-carbon-black text-white"

// Light background
className="bg-magna-chrome-white text-magna-carbon-black"

// Gray elements
className="text-magna-cool-gray border-magna-cool-gray"

// Blue accent
className="text-magna-electric-blue"
```

---

## Accessibility

Ensure sufficient contrast ratios (WCAG 2.1 AA minimum):

| Combination | Contrast Ratio | Pass? |
|-------------|----------------|-------|
| Ignition Red on White | 4.8:1 | ✅ AA |
| White on Carbon Black | 21:1 | ✅ AAA |
| Cool Gray on White | 3.5:1 | ⚠️ Large text only |
| White on Ignition Red | 4.8:1 | ✅ AA |

**Recommendations:**
- Use Cool Gray for decorative elements, not primary text
- Always test interactive elements for accessibility
