# Toyota Gazoo Racing Theme Guide

This document outlines the Toyota Gazoo Racing inspired theme setup for the Branch Appointment System frontend.

## 🎨 Color Palette

### Primary Colors

- **Toyota Red**: `#EB0A1E` - Primary brand color
- **Toyota Red Dark**: `#C00015` - Hover states and accents
- **Toyota Black**: `#000000` - Secondary color
- **Toyota White**: `#FFFFFF` - Background color

### Surface Colors

- **Surface**: `#F5F5F5` - Cards and panels
- **Surface Dark**: `#E5E5E5` - Hover states for surfaces

### Text Colors

- **Primary Text**: `#000000` - Main text color
- **Secondary Text**: `#666666` - Secondary text color
- **White Text**: `#FFFFFF` - Text on dark backgrounds

## 🎯 Usage

### CSS Custom Properties

All colors are available as CSS custom properties:

```css
:root {
  --toyota-red: #eb0a1e;
  --toyota-red-dark: #c00015;
  --toyota-black: #000000;
  --toyota-white: #ffffff;
  --toyota-gray: #f5f5f5;
  --toyota-gray-dark: #e5e5e5;
  --toyota-text-primary: #000000;
  --toyota-text-secondary: #666666;
  --toyota-text-white: #ffffff;
}
```

### Tailwind Classes

Custom utility classes are available:

#### Background Colors

- `bg-toyota-red` - Primary red background
- `bg-toyota-red-dark` - Dark red background
- `bg-toyota-black` - Black background
- `bg-toyota-surface` - Light gray surface background

#### Text Colors

- `text-toyota-red` - Red text
- `text-toyota-black` - Black text
- `text-toyota-secondary` - Secondary gray text

#### Border Colors

- `border-toyota-red` - Red border
- `border-toyota-black` - Black border

#### Hover States

- `hover:bg-toyota-red-dark` - Dark red on hover
- `hover:bg-toyota-gray-dark` - Dark gray on hover

### Button Components

Pre-built button styles:

```tsx
// Primary button (red background)
<button className="btn-toyota-primary">Primary Action</button>

// Secondary button (black background)
<button className="btn-toyota-secondary">Secondary Action</button>

// Outline button (red border, transparent background)
<button className="btn-toyota-outline">Outline Action</button>
```

### Card Components

```tsx
// Standard card with Toyota theme
<div className="card-toyota">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

## 🔤 Typography

### Font Family

- **Primary**: Inter (Google Fonts)
- **Monospace**: Geist Mono

### Font Weights

- 400 (Regular)
- 500 (Medium) - Default
- 600 (Semi-bold)
- 700 (Bold)
- 800 (Extra-bold)

## 🎭 Theme Provider

The `ThemeProvider` component wraps your application and provides theme context:

```tsx
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  return <ThemeProvider>{/* Your app content */}</ThemeProvider>;
}
```

## 🎨 Design Principles

### Racing-Inspired Elements

- **Speed**: Fast transitions and smooth animations
- **Precision**: Clean lines and exact spacing
- **Performance**: Optimized for speed and efficiency
- **Bold**: Strong contrast and impactful colors

### Layout Guidelines

- Use white backgrounds for main content areas
- Apply light gray (`#F5F5F5`) for cards and panels
- Use red for primary actions and highlights
- Use black for headers and secondary elements
- Maintain consistent spacing using the defined scale

### Animation Guidelines

- Use `transition-colors duration-200` for color changes
- Implement `animate-pulse-red` for attention-grabbing elements
- Keep animations subtle and purposeful

## 🚀 Getting Started

1. Import the theme provider in your root layout
2. Use the provided utility classes for consistent styling
3. Follow the design principles for new components
4. Test hover states and transitions
5. Ensure accessibility with proper contrast ratios

## 📱 Responsive Design

The theme is built with mobile-first responsive design:

- Use `sm:`, `md:`, `lg:`, `xl:` prefixes for breakpoints
- Ensure touch targets are at least 44px
- Test on various screen sizes

## ♿ Accessibility

- Maintain WCAG AA contrast ratios
- Use semantic HTML elements
- Provide focus indicators
- Test with screen readers
- Ensure keyboard navigation works properly
