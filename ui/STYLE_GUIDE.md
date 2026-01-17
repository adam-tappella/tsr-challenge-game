# Style Guide

This document defines the design tokens and component patterns for your application.

## Quick Links

| Resource | Description |
|----------|-------------|
| [tailwind.config.js](../config-templates/frontend/tailwind.config.js.template) | Tailwind CSS configuration with design tokens |
| [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) | CSS variables and color definitions |
| [code-templates/](../code-templates/) | Code templates for Components, Hooks, Stores |

---

## 1. Design Tokens

### Colors

- **Primary**: `hsl(221.2 83.2% 53.3%)` (Blue) - Used for primary actions, active states.
- **Background**: `hsl(0 0% 100%)` (White) - Main application background.
- **Card Background**: `hsl(0 0% 100%)` (White) - Component background.
- **Text**:
    - **Primary**: `hsl(222.2 84% 4.9%)` (Dark Slate) - Headings, body text.
    - **Muted**: `hsl(215.4 16.3% 46.9%)` (Gray) - Secondary text, placeholders, legends.
- **Border**: `hsl(214.3 31.8% 91.4%)` (Light Gray) - Dividers, input borders.

### Typography

- **Font Family**: 'Inter', sans-serif (or your preferred font)
- **Headings**:
    - **Pane Title**: `text-xl font-semibold` (approx. 20px) - Used for card/section titles.
    - **Section Header**: `text-lg font-medium` - Used for subsections.
- **Body**:
    - **Default**: `text-sm` (14px) - Standard UI text.
    - **Small**: `text-xs` (12px) - Hints, legends, badges.

### Shadows & Radius

- **Shadows**:
    - **Pane/Card**: `0 4px 20px -2px rgba(0, 0, 0, 0.05)` (Soft, diffused shadow)
- **Border Radius**:
    - **Card/Pane**: `22px`
    - **Button/Input**: `9999px` (Pill shape)
    - **Badge**: `9999px` (Pill shape)

## 2. Component Patterns

### Buttons
- **Shape**: Pill-shaped (`rounded-full`).
- **Styles**:
    - **Primary**: Solid blue background, white text.
    - **Secondary/Outline**: White background, light gray border, dark text.
- **Content**: Often includes an icon on the left (e.g., Download icon).

### Inputs & Search
- **Shape**: Pill-shaped (`rounded-full`).
- **Style**: Light gray border, white background.
- **Search**: Includes a search icon inside the input on the left.
- **Placeholder**: Muted gray text.

### Cards / Panes
- **Shape**: Large rounded corners (`rounded-[22px]`).
- **Shadow**: Soft, diffused shadow.
- **Header**: Title on the left, optional controls (filters, settings) on the right.

### Tables
- **Headers**:
    - Light gray/off-white background.
    - Sticky positioning (`sticky top-0`).
    - Sortable columns indicated by arrows.
    - **Resizable columns**: Adjustable widths via drag handles.
- **Rows**: White background, border separators.
- **Cells**: Clean text, optional status bars (progress bars) inside cells.

### Legends & Badges
- **Style**: Pill-shaped tag.
- **Layout**: Colored circle (dot) + Label text.
- **Background**: Very light gray/blue tint (`bg-slate-50`).

### Loading Screen
- **Indicator**: Spinning ring (partial circle) in primary color.
- **Layout**: Centered on screen.
- **Typography**: "Loading Dashboard" (Bold), "Loading data..." (Muted).

### Tooltips / Help
- **Trigger**: Outlined circle with a question mark (`?`).
- **Style**: Muted gray color, hover state triggers tooltip.

## 3. Data Tables

Key patterns:
- **Container**: `rounded-xl border border-border bg-card shadow-sm`
- **Header**: `bg-gradient-to-r from-slate-50 to-gray-50`
- **Row hover**: `hover:bg-blue-50/50 transition-colors`
- **Sortable columns**: Click to cycle through unsorted -> ascending -> descending
- **Resizable columns**: Drag column borders to adjust width

### Column Width Presets
| Column Type | Width | Class |
|-------------|-------|-------|
| Checkbox | 40px | `w-10` |
| Part Number | 128px | `w-32` |
| Description | 200px+ | `min-w-[200px]` |
| Quantity | 96px | `w-24` |
| Currency | 112px | `w-28` |
| Status Badge | 128px | `w-32` |
| Actions | 96px | `w-24` |

## 4. KPI Cards

Key metrics should be displayed using consistent KPI card patterns:

- **Container**: `rounded-[22px] border border-border bg-card p-5 shadow-sm`
- **Highlight**: Optional top border (4px) in status color (Blue/Green/Yellow).
- **Header**:
  - Title: Uppercase, small text (`text-[0.75rem] font-bold text-muted-foreground`).
  - Controls: Help icon (`?`) on the far right.
- **Value**: Large, bold text (`text-[2.25rem] font-bold`).
- **Footer**:
  - Percentage: Bold colored text (Orange for warnings, Emerald for success/neutral).
  - Subtitle: Muted gray text, inline with percentage.

## 5. Code Templates

For consistency, please use the templates in `code-templates/`:

- **COMPONENT_TEMPLATE.tsx**: Standard functional component structure with `cn` utility.
- **HOOK_TEMPLATE.ts**: Generic hook with loading/error states.
- **ZUSTAND_STORE_TEMPLATE.ts**: State management store with persistence.
