# McKinsey Branding Guidelines

This folder contains brand guidelines and assets for McKinsey projects.

## Official Resources

For the most up-to-date brand guidelines, always refer to the official McKinsey Brand Portal:

- **Brand Portal**: [McKinsey Brand Center](https://brand.mckinsey.com) (internal access required)
- **Visual Identity Guidelines**: Available on the Brand Portal
- **Logo Downloads**: Available on the Brand Portal

## Quick Reference

### Primary Colors

See [colors.md](./colors.md) for the complete color palette.

| Color | Hex | Usage |
|-------|-----|-------|
| McKinsey Blue | `#007CBF` | Primary brand color, CTAs |
| McKinsey Dark Blue | `#004C7F` | Headers, accents |
| White | `#FFFFFF` | Backgrounds |
| Dark Gray | `#333333` | Body text |

### Typography

McKinsey uses specific typefaces for brand consistency:

- **Headlines**: Bower (licensed font)
- **Body Text**: Proxima Nova or system fonts
- **Fallback**: System fonts (Helvetica, Arial, sans-serif)

For web projects without licensed fonts, use:
- **Headlines**: Inter, Segoe UI, or system fonts
- **Body**: Inter, -apple-system, BlinkMacSystemFont, sans-serif

### Logo Usage

- Always maintain clear space around the logo
- Do not stretch, distort, or recolor the logo
- Use provided logo files from the Brand Portal
- Minimum size requirements apply (check Brand Portal)

## Client-Specific Branding

When working on client projects, you may need to incorporate client branding:

1. Create a `client-branding/` folder in your project
2. Store client colors, logos, and guidelines there
3. Use CSS variables to easily switch between McKinsey and client themes

Example CSS structure:

```css
:root {
  /* McKinsey defaults */
  --brand-primary: #007CBF;
  --brand-secondary: #004C7F;
  --brand-text: #333333;
}

/* Override for client branding */
.client-theme {
  --brand-primary: var(--client-primary, #007CBF);
  --brand-secondary: var(--client-secondary, #004C7F);
  --brand-text: var(--client-text, #333333);
}
```

## Implementation Notes

### Tailwind CSS Integration

Add McKinsey colors to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'mck-blue': '#007CBF',
        'mck-dark-blue': '#004C7F',
        'mck-light-blue': '#E6F3F9',
        'mck-gray': {
          100: '#F5F5F5',
          300: '#D1D1D1',
          600: '#666666',
          900: '#333333',
        },
      },
    },
  },
}
```

### Favicon and Meta Tags

Include appropriate branding in your `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#007CBF">
<meta name="application-name" content="[Your App Name] - McKinsey">
```

## Compliance

All McKinsey-branded materials must comply with:

- McKinsey Visual Identity Guidelines
- McKinsey Digital Standards
- Client confidentiality requirements
- Accessibility standards (WCAG 2.1 AA)

When in doubt, consult the Brand Portal or your engagement manager.
