# Glassmorphic UI System

A modern, beautiful glassmorphic UI component library built with React 19 and TailwindCSS for the Sashainfinity LMS platform.

## Features

- **Glassmorphic Design**: Frosted glass effects with backdrop blur
- **Bento Grid Layout**: Flexible CSS Grid system for dashboard cards
- **Modern Card Components**: Specialized cards for courses, stats, and content
- **Parallax Effects**: Depth effects during scrolling and mouse interactions
- **Fully Responsive**: Mobile-first design with touch-friendly interactions
- **Performance Optimized**: Hardware acceleration and reduced motion support
- **Accessible**: WCAG AA compliant with proper focus states

## Installation

The components are located in `frontend/src/components/ui/glassmorphic/`.

```bash
# Import individual components
import { GlassContainer } from '@/components/ui/glassmorphic';
import { BentoGrid, BentoItem } from '@/components/ui/glassmorphic';
import { GlassCard, GlassStatCard, GlassCourseCard } from '@/components/ui/glassmorphic';
import { ParallaxSection, ParallaxLayer } from '@/components/ui/glassmorphic';

# Or import all at once
import * as Glass from '@/components/ui/glassmorphic';
```

## Components

### GlassContainer

A reusable glassmorphic container component with configurable effects.

```jsx
import { GlassContainer } from '@/components/ui/glassmorphic';

<GlassContainer
  variant="light"
  blur={16}
  opacity={0.1}
  border={true}
  hoverEffect="lift"
  onClick={() => console.log('clicked')}
>
  <p>Your content here</p>
</GlassContainer>
```

**Props:**
- `variant` ('light' | 'dark' | 'colored') - Glass effect style
- `blur` (0-100) - Backdrop blur intensity
- `opacity` (0-1) - Background opacity
- `border` (boolean) - Show/hide border
- `hoverEffect` ('lift' | 'glow' | 'scale' | 'none') - Hover animation
- `onClick` (function) - Click handler

### BentoGrid & BentoItem

Modern CSS Grid layout system for dashboard cards.

```jsx
import { BentoGrid, BentoItem } from '@/components/ui/glassmorphic';

<BentoGrid columns={4} gap={24}>
  <BentoItem colSpan={2} rowSpan={1}>
    <GlassCard>Wide card</GlassCard>
  </BentoItem>
  <BentoItem>
    <GlassCard>Small card</GlassCard>
  </BentoItem>
</BentoGrid>
```

**BentoGrid Props:**
- `columns` (1-6) - Number of columns
- `gap` (number) - Gap between items in pixels
- `autoFit` (boolean) - Use auto-fit for responsive columns
- `minItemWidth` (string) - Minimum width for auto-fit items

**BentoItem Props:**
- `colSpan` (1-6) - Columns to span
- `rowSpan` (1-4) - Rows to span
- `colStart` (number) - Column start position
- `rowStart` (number) - Row start position

### GlassCard, GlassStatCard, GlassCourseCard

Specialized card components for different use cases.

```jsx
import { GlassCard, GlassStatCard, GlassCourseCard } from '@/components/ui/glassmorphic';

// Basic Card
<GlassCard
  variant="default"
  title="Card Title"
  subtitle="Card subtitle"
  icon="🎯"
  size="md"
  interactive={true}
>
  <p>Card content goes here</p>
</GlassCard>

// Stat Card
<GlassStatCard
  value="12,500+"
  label="Active Students"
  change="+15%"
  changeType="positive"
  icon="👨‍🎓"
/>

// Course Card
<GlassCourseCard
  title="Data Analytics Masterclass"
  instructor="Dr. Sarah Johnson"
  level="Intermediate"
  duration="12 weeks"
  price="₹29,999"
  progress={75}
  image="https://example.com/image.jpg"
  onClick={() => navigate('/courses/1')}
/>
```

**GlassCard Props:**
- `variant` ('default' | 'course' | 'stat' | 'content' | 'profile')
- `size` ('sm' | 'md' | 'lg' | 'xl')
- `icon` (ReactNode) - Icon component
- `title` (string) - Card title
- `subtitle` (string) - Card subtitle
- `actions` (ReactNode) - Action buttons
- `interactive` (boolean) - Enable hover effects
- `onClick` (function) - Click handler
- `image` (string) - Background image URL
- `imagePosition` (string) - Background image position

### ParallaxSection, ParallaxLayer, ParallaxCard

Components for creating depth effects during scrolling.

```jsx
import { ParallaxSection, ParallaxLayer, ParallaxCard } from '@/components/ui/glassmorphic';

// Parallax Section
<ParallaxSection speed={0.3} background="https://example.com/bg.jpg">
  <h1>Hero Content</h1>
</ParallaxSection>

// Parallax Layers
<ParallaxSection speed={0.3}>
  <ParallaxLayer depth={2} float={true}>
    <div className="floating-shape"></div>
  </ParallaxLayer>
  <ParallaxLayer depth={-1}>
    <div className="content">Main content</div>
  </ParallaxLayer>
</ParallaxSection>

// Parallax Card (3D mouse effect)
<ParallaxCard depth={0.5} rotateIntensity={5}>
  <GlassCard>Hover me for 3D effect</GlassCard>
</ParallaxCard>
```

**ParallaxSection Props:**
- `speed` (0.1-0.5) - Parallax speed multiplier
- `background` (string) - Background image or color
- `disabled` (boolean) - Disable parallax effect
- `offset` (number) - Vertical offset in pixels

**ParallaxLayer Props:**
- `depth` (-2 to 2) - Depth factor (2 is closest)
- `float` (boolean) - Enable floating animation

**ParallaxCard Props:**
- `depth` (0-1) - 3D depth intensity
- `rotateIntensity` (1-10) - Mouse rotation intensity

## Usage Examples

### Dashboard Layout

```jsx
import { BentoGrid, BentoItem, GlassStatCard } from '@/components/ui/glassmorphic';

function Dashboard() {
  return (
    <BentoGrid columns={4} gap={24}>
      <BentoItem><GlassStatCard value="12,500+" label="Students" change="+15%" /></BentoItem>
      <BentoItem><GlassStatCard value="450+" label="Courses" change="+23" /></BentoItem>
      <BentoItem><GlassStatCard value="98%" label="Success Rate" change="+2%" /></BentoItem>
      <BentoItem><GlassStatCard value="4.9" label="Rating" change="+0.3" /></BentoItem>
    </BentoGrid>
  );
}
```

### Course Listing

```jsx
import { BentoGrid, GlassCourseCard } from '@/components/ui/glassmorphic';

function CourseListing() {
  const courses = [
    { id: 1, title: 'Data Analytics', instructor: 'Dr. Smith', level: 'Intermediate' },
    { id: 2, title: 'React JS', instructor: 'John Doe', level: 'Beginner' }
  ];

  return (
    <BentoGrid columns={3} gap={24}>
      {courses.map(course => (
        <BentoItem key={course.id}>
          <GlassCourseCard {...course} onClick={() => handleCourseClick(course.id)} />
        </BentoItem>
      ))}
    </BentoGrid>
  );
}
```

### Hero Section with Parallax

```jsx
import { ParallaxSection, ParallaxLayer, GlassContainer } from '@/components/ui/glassmorphic';

function HeroSection() {
  return (
    <ParallaxSection speed={0.3}>
      <ParallaxLayer depth={2} float={true}>
        <div className="floating-bg-element" />
      </ParallaxLayer>

      <GlassContainer variant="colored" blur={20} opacity={0.15}>
        <h1>Welcome to Sashainfinity</h1>
        <p>Empowering learners with cutting-edge technology</p>
      </GlassContainer>
    </ParallaxSection>
  );
}
```

## Styling

### Custom CSS Variables

```css
:root {
  --glass-blur: 16px;
  --glass-opacity: 0.1;
  --bento-columns: 4;
  --bento-gap: 24px;
  --bento-min-width: 280px;
  --card-image: url('');
  --card-image-position: center;
}
```

### Theme Customization

Components support multiple variants:

- **Light**: Default white glass effect
- **Dark**: Dark glass effect for dark backgrounds
- **Colored**: Brand-colored glass effect (uses #f4911a)

### Responsive Breakpoints

- Desktop: 1200px+ (4 columns)
- Tablet: 900px - 1200px (3 columns)
- Mobile: 600px - 900px (2 columns)
- Small: < 600px (1 column)

## Performance

The glassmorphic UI system is optimized for performance:

- **Hardware Acceleration**: Uses `transform: translateZ(0)` for GPU acceleration
- **Passive Event Listeners**: Scroll and resize listeners use `{ passive: true }`
- **Will-change**: Properly hints browser for optimized animations
- **Reduced Motion**: Respects `prefers-reduced-motion` for accessibility
- **Lazy Loading**: Parallax effects can be disabled on mobile

## Accessibility

- WCAG AA compliant color contrasts
- Proper focus states for keyboard navigation
- Semantic HTML structure
- ARIA labels for interactive elements
- Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Demo

To see all components in action, import and render the `GlassmorphicDemo` component:

```jsx
import GlassmorphicDemo from '@/components/ui/glassmorphic/GlassmorphicDemo';

function App() {
  return <GlassmorphicDemo />;
}
```

## Tips & Best Practices

1. **Use Sparingly**: Glassmorphic effects work best when used strategically, not everywhere
2. **Contrast**: Ensure text remains readable against glass backgrounds
3. **Performance**: Limit parallax effects on mobile devices
4. **Layering**: Use z-index carefully when stacking glass elements
5. **Testing**: Always test on different screen sizes and devices

## Troubleshooting

**Blur not working?**
- Ensure backdrop-filter is supported in your target browsers
- Check that parent elements don't have overflow: hidden
- Verify z-index stacking context

**Parallax not smooth?**
- Reduce the number of parallax layers
- Use `disabled` prop on mobile devices
- Check for other scroll event listeners

**Grid not responsive?**
- Verify container has proper width
- Check that auto-fit has appropriate min-width
- Ensure parent doesn't have fixed width

## License

This component library is part of the Sashainfinity LMS platform.
