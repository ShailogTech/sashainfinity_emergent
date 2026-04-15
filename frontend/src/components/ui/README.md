# Glassmorphic Design System & Bento-Box Dashboard

A comprehensive, production-ready design system featuring glassmorphic UI components, bento-grid layouts, and smooth parallax animations for the Sasha Infinity LMS platform.

## Components

### Glass Cards (`glass-card.jsx`)

Beautiful frosted glass effect cards with multiple variants and sizes.

```jsx
import { GlassCard, GlassStatCard, GlassProgressCard } from '@/components/ui/glass-card';

<GlassCard variant="primary" size="lg" hoverable shimmer>
  <GlassCardHeader title="Card Title" icon="🎯" />
  <GlassCardBody>Card content goes here</GlassCardBody>
  <GlassCardFooter>Footer content</GlassCardFooter>
</GlassCard>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'dark' | 'gradient' | 'success' | 'accent' | 'warning' | 'error'
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `blur`: Blur intensity in pixels (default: 20)
- `opacity`: Background opacity 0-1 (default: 0.7)
- `bordered`: Show border (default: true)
- `shadow`: Enable shadow (default: true)
- `hoverable`: Add hover effects (default: false)
- `shimmer`: Add shimmer effect on hover (default: false)
- `gradient`: Use gradient background (default: false)
- `noise`: Add noise texture overlay (default: false)

**Specialized Cards:**

```jsx
// Stat Card with change indicator
<GlassStatCard
  value="12,500+"
  label="Active Students"
  change="+15%"
  changeType="positive"
  icon="👨‍🎓"
  variant="primary"
/>

// Progress Card with circular or linear progress
<GlassProgressCard
  title="Course Progress"
  progress={18}
  total={24}
  type="circular"
  variant="primary"
/>
```

### Bento Grid (`bento-grid.jsx`)

Modern CSS Grid layout system for dashboard cards.

```jsx
import { BentoGrid, BentoItem } from '@/components/ui/bento-grid';

<BentoGrid columns={4} gap={24} animation="fade">
  <BentoItem colSpan={2} rowSpan={2}>
    {/* Large featured card */}
  </BentoItem>
  <BentoItem>
    {/* Regular card */}
  </BentoItem>
</BentoGrid>
```

**Props:**
- `columns`: Number of columns (1-6, default: 4)
- `gap`: Gap between items in pixels (default: 24)
- `autoFit`: Use auto-fit for responsive columns
- `minItemWidth`: Minimum width for auto-fit items
- `animation`: 'fade' | 'scale' | 'slide' | 'none'
- `staggerDelay`: Delay between item animations in ms
- `dense`: Enable dense packing algorithm

**BentoItem Props:**
- `colSpan`: Number of columns to span (1-6)
- `rowSpan`: Number of rows to span (1-4)
- `colStart`: Column start position
- `rowStart`: Row start position
- `alignVertical`: 'top' | 'center' | 'bottom' | 'stretch'

### Parallax Components (`parallax-container.jsx`)

Smooth parallax scrolling and 3D tilt effects.

```jsx
import {
  ParallaxContainer,
  ParallaxLayer,
  ParallaxTilt,
  ParallaxScrollTrigger
} from '@/components/ui/parallax-container';

// Scroll parallax
<ParallaxContainer speed={0.3}>
  Content moves at different speed during scroll
</ParallaxContainer>

// Depth layers
<ParallaxLayer depth={2} float={true}>
  Floating element with parallax
</ParallaxLayer>

// 3D tilt on mouse move
<ParallaxTilt maxRotate={10} scale={1.05} glare>
  <GlassCard>Content</GlassCard>
</ParallaxTilt>

// Scroll trigger animation
<ParallaxScrollTrigger animation="fade-up" threshold={0.2}>
  Content animates when scrolled into view
</ParallaxScrollTrigger>
```

## Usage Examples

### Dashboard Layout

```jsx
import {
  GlassCard,
  GlassStatCard,
  BentoGrid,
  BentoItem
} from '@/components/ui/glassmorphic';

const Dashboard = () => (
  <div className="dashboard-page">
    <BentoGrid columns={4} gap={20}>
      <BentoItem colSpan={2} rowSpan={2}>
        <GlassCard variant="primary">
          {/* Featured content */}
        </GlassCard>
      </BentoItem>
      <BentoItem>
        <GlassStatCard {...stats} />
      </BentoItem>
    </BentoGrid>
  </div>
);
```

## CSS Classes

The design system includes utility classes in `App.css`:

```css
.glass-container        /* Basic glass container */
.glass-container-dark   /* Dark variant */
.glass-container-primary /* Primary accent */

.glass-btn             /* Glassmorphic button */
.glass-btn-primary     /* Primary button style */

.glass-input           /* Glassmorphic input */
.glass-modal           /* Modal overlay */
.glass-badge           /* Badge component */
.glass-tabs            /* Tab navigation */
```

## Responsive Behavior

- **Desktop (>1200px)**: 4 columns
- **Tablet (900-1200px)**: 3 columns
- **Mobile (600-900px)**: 2 columns
- **Small Mobile (<600px)**: 1 column

## File Structure

```
frontend/src/
├── components/ui/
│   ├── glass-card.jsx          # Glass card components
│   ├── glass-card.css          # Glass card styles
│   ├── bento-grid.jsx          # Bento grid layout
│   ├── bento-grid.css          # Bento grid styles
│   ├── parallax-container.jsx  # Parallax effects
│   ├── parallax-container.css  # Parallax styles
│   └── glassmorphic/
│       └── index.js            # Component exports
├── pages/
│   ├── DashboardPage.jsx       # Dashboard implementation
│   ├── DashboardPage.css       # Dashboard styles
│   ├── GlassmorphicDemo.jsx    # Component showcase
│   └── GlassmorphicDemo.css    # Demo styles
└── App.css                     # Global glassmorphic styles
```

## Demo

View the component showcase at `/demo/glassmorphic` or visit `/dashboard` for the full implementation.

## Features

- ✅ Frosted glass effects with backdrop blur
- ✅ Multiple card variants (10+ styles)
- ✅ Bento-grid layouts with spanning
- ✅ Parallax scrolling effects
- ✅ 3D tilt interactions
- ✅ Scroll-triggered animations
- ✅ Progress indicators (circular/linear)
- ✅ Stat cards with change indicators
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility considerations
- ✅ Performance optimized (GPU acceleration)
- ✅ Reduced motion support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Dependencies

- React 19+
- framer-motion (for animations)
- gsap (for advanced animations)
- clsx + tailwind-merge (for className utilities)
