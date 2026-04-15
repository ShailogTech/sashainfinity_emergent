# Glassmorphic UI System Documentation

A complete, production-ready glassmorphic UI system for React applications with bento-box layouts, parallax transitions, and modern aesthetics.

## Features

- **Glassmorphic Components**: Beautiful frosted glass effects with backdrop blur
- **Bento-Box Layouts**: Modern responsive grid system with flexible card sizing
- **Parallax Effects**: Smooth scroll animations powered by GSAP
- **3D Interactions**: Interactive tilt effects on mouse movement
- **Multiple Variants**: Pre-built color schemes and design tokens
- **Fully Responsive**: Mobile-first design with breakpoints
- **Accessible**: WCAG compliant with reduced motion support
- **Performance Optimized**: Hardware-accelerated animations

## Installation

The system is already integrated into your React LMS platform. All components are located in `frontend/src/components/ui/`.

```bash
# Components are ready to use
# No additional installation required
```

## Component Library

### GlassCard

A versatile glassmorphic card component with multiple variants.

```jsx
import GlassCard from '@/components/ui/GlassCard';

// Basic usage
<GlassCard>
  <p>Your content here</p>
</GlassCard>

// With variant and size
<GlassCard variant="primary" size="lg" hoverable>
  <h3>Primary Card</h3>
  <p>Beautiful gradient background</p>
</GlassCard>

// All variants
<GlassCard variant="default">Default Card</GlassCard>
<GlassCard variant="primary">Primary Card</GlassCard>
<GlassCard variant="secondary">Secondary Card</GlassCard>
<GlassCard variant="accent">Accent Card</GlassCard>
<GlassCard variant="success">Success Card</GlassCard>
<GlassCard variant="warning">Warning Card</GlassCard>
<GlassCard variant="error">Error Card</GlassCard>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `blur`: number (default: 20)
- `opacity`: number (0-1)
- `bordered`: boolean
- `shadow`: boolean
- `hoverable`: boolean
- `gradient`: boolean

### GlassModal

A beautiful glassmorphic modal dialog.

```jsx
import GlassModal from '@/components/ui/GlassModal';

const [modalOpen, setModalOpen] = useState(false);

<GlassModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  size="lg"
>
  <GlassModal.Header>
    <h2>Modal Title</h2>
  </GlassModal.Header>

  <GlassModal.Body>
    <p>Your content here</p>
  </GlassModal.Body>

  <GlassModal.Footer>
    <button onClick={() => setModalOpen(false)}>Close</button>
  </GlassModal.Footer>
</GlassModal>
```

**Props:**
- `open`: boolean
- `onClose`: function
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlay`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

### GlassContainer

A glassmorphic container for layout sections.

```jsx
import GlassContainer from '@/components/ui/GlassContainer';

<GlassContainer variant="colored" gradient>
  <h2>Section Title</h2>
  <p>Section content with beautiful glass effect</p>
</GlassContainer>
```

**Props:**
- `variant`: 'default' | 'dark' | 'colored'
- `gradient`: boolean
- `blur`: number

### BentoBox

Modern responsive bento-grid layout system.

```jsx
import BentoBox from '@/components/ui/BentoBox';

<BentoBox columns="auto" gap={24}>
  {/* Standard card */}
  <BentoBox.Item>
    <BentoCard variant="default">
      <p>Standard card</p>
    </BentoCard>
  </BentoBox.Item>

  {/* Wide card (2 columns) */}
  <BentoBox.Item span="2">
    <BentoCard variant="primary">
      <p>Wide card</p>
    </BentoCard>
  </BentoBox.Item>

  {/* Tall card (2 rows) */}
  <BentoBox.Item rowSpan="2">
    <BentoCard variant="secondary">
      <p>Tall card</p>
    </BentoCard>
  </BentoBox.Item>
</BentoBox>
```

**BentoBox Props:**
- `columns`: '1' | '2' | '3' | '4' | 'auto'
- `gap`: number
- `autoResize`: boolean

**BentoBox.Item Props:**
- `span`: '1' | '2' | '3' | '4'
- `rowSpan`: '1' | '2' | '3'
- `tall`: boolean
- `wide`: boolean

**BentoCard Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'accent' | 'gradient'
- `interactive`: boolean

### ParallaxContainer

Advanced parallax and animation components.

```jsx
import ParallaxContainer from '@/components/ui/ParallaxContainer';

// Parallax scroll effect
<ParallaxContainer speed={0.5} direction="vertical">
  <div>Content with parallax</div>
</ParallaxContainer>

// Layer parallax
<ParallaxContainer.Layer depth={0.5}>
  <div>Layer that moves on scroll</div>
</ParallaxContainer.Layer>

// 3D tilt effect
<ParallaxContainer.Tilt maxTilt={15}>
  <GlassCard>
    <p>Card with 3D tilt on hover</p>
  </GlassCard>
</ParallaxContainer.Tilt>

// Scroll reveal animation
<ParallaxContainer.Reveal animation="fadeUp" delay={0.2}>
  <GlassCard>
    <p>Reveals on scroll</p>
  </GlassCard>
</ParallaxContainer.Reveal>
```

**ParallaxContainer Props:**
- `speed`: number (default: 0.5)
- `direction`: 'vertical' | 'horizontal' | 'both'
- `disabled`: boolean

**ParallaxLayer Props:**
- `depth`: number (0-1)
- `disabled`: boolean

**ParallaxTilt Props:**
- `maxTilt`: number (default: 15)
- `disabled`: boolean

**ScrollReveal Props:**
- `animation`: 'fadeUp' | 'fadeDown' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
- `delay`: number
- `duration`: number

## Utility Functions

```jsx
import {
  generateGradient,
  generateGlassShadow,
  prefersReducedMotion,
  createGlassModal,
  applyGlassStyles,
} from '@/lib/glassmorphic';

// Generate random gradient
const gradient = generateGradient('warm');

// Generate glass shadow
const shadow = generateGlassShadow(0.5);

// Check for reduced motion preference
const reducedMotion = prefersReducedMotion();

// Create modal programmatically
const modal = createGlassModal({
  title: 'Dynamic Modal',
  content: '<p>Modal content</p>',
  size: 'md',
  onClose: () => {},
});

// Apply glass styles to any element
applyGlassStyles(element, {
  blur: 20,
  opacity: 0.7,
  border: true,
  shadow: true,
  gradient: false,
});
```

## CSS Classes

### Glassmorphism Utilities

```css
.glassmorphism-sm    /* Small blur, minimal transparency */
.glassmorphism-md    /* Medium blur and transparency */
.glassmorphism-lg    /* Large blur, high transparency */

.glassmorphism-dark-sm    /* Dark variant */
.glassmorphism-dark-md    /* Dark variant */

.glassmorphism-primary    /* Orange tint */
.glassmorphism-secondary  /* Blue tint */
.glassmorphism-accent     /* Purple tint */
```

### Animation Classes

```css
.reveal-fade-up    /* Fade up on scroll */
.reveal-fade-in    /* Fade in on scroll */
.reveal-scale      /* Scale on scroll */

.parallax-slow     /* Slow parallax */
.parallax-medium   /* Medium parallax */
.parallax-fast     /* Fast parallax */

.float             /* Floating animation */
.pulse-glow        /* Pulsing glow effect */
.morph-bg          /* Morphing background */

.stagger-1 through .stagger-5    /* Stagger animation delays */
```

### Text Utilities

```css
.gradient-text           /* Gradient text effect */
.gradient-text-primary   /* Primary gradient text */
```

## Design Tokens

```css
/* Blur Intensities */
--glass-blur-sm: 10px;
--glass-blur-md: 20px;
--glass-blur-lg: 40px;

/* Opacity Levels */
--glass-opacity-subtle: 0.5;
--glass-opacity-default: 0.7;
--glass-opacity-strong: 0.9;

/* Border Radius */
--glass-radius-sm: 12px;
--glass-radius-md: 16px;
--glass-radius-lg: 20px;
--glass-radius-xl: 24px;

/* Animation Timing */
--glass-ease: cubic-bezier(0.16, 1, 0.3, 1);
--glass-duration: 0.3s;
```

## Examples

### Dashboard Layout

```jsx
<BentoBox gap={24}>
  {/* Main content area */}
  <BentoBox.Item span="2" rowSpan="2">
    <GlassCard variant="primary" size="xl" gradient>
      <h2>Current Progress</h2>
      {/* Progress bars, charts, etc. */}
    </GlassCard>
  </BentoBox.Item>

  {/* Side widgets */}
  <BentoBox.Item>
    <GlassCard variant="success" size="md">
      <h3>Daily Streak</h3>
      {/* Streak counter */}
    </GlassCard>
  </BentoBox.Item>

  <BentoBox.Item>
    <GlassCard variant="accent" size="md">
      <h3>Quick Stats</h3>
      {/* Stats grid */}
    </GlassCard>
  </BentoBox.Item>
</BentoBox>
```

### Animated Section

```jsx
<section>
  <ParallaxContainer.Reveal animation="fadeUp">
    <GlassCard variant="default" size="lg">
      <h2>Section Title</h2>
      <p>Content that reveals on scroll</p>
    </GlassCard>
  </ParallaxContainer.Reveal>

  <ParallaxContainer.Reveal animation="fadeUp" delay={0.2}>
    <GlassCard variant="primary" size="lg">
      <h2>Next Section</h2>
      <p>Delays reveal for stagger effect</p>
    </GlassCard>
  </ParallaxContainer.Reveal>
</section>
```

### Interactive Cards

```jsx
<ParallaxContainer.Tilt maxTilt={15}>
  <GlassCard variant="primary" hoverable gradient>
    <h3>Interactive Card</h3>
    <p>Responds to mouse movement with 3D tilt</p>
  </GlassCard>
</ParallaxContainer.Tilt>
```

## Performance Considerations

1. **Reduced Motion**: All components respect `prefers-reduced-motion` media query
2. **Hardware Acceleration**: Animations use `transform` and `opacity` for GPU acceleration
3. **Lazy Loading**: Components can be lazy loaded for better initial load time
4. **Will Change**: Proper use of `will-change` for animated properties
5. **Debouncing**: Scroll events are properly throttled

## Accessibility

- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Reduced motion support
- High contrast ratios

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Customization

### Adding New Variants

```jsx
// In GlassCard.jsx
const variantStyles = {
  // ...existing variants
  custom: {
    bg: 'rgba(123, 45, 67, 0.1)',
    border: 'rgba(123, 45, 67, 0.3)',
    gradient: 'linear-gradient(135deg, rgba(123, 45, 67, 0.15) 0%, rgba(123, 45, 67, 0.05) 100%)',
    shadow: '0 8px 32px rgba(123, 45, 67, 0.15)',
    hoverShadow: '0 12px 48px rgba(123, 45, 67, 0.25)',
  },
};
```

### Custom Animations

```css
@keyframes customAnimation {
  from { /* start state */ }
  to { /* end state */ }
}

.custom-class {
  animation: customAnimation 0.8s ease;
}
```

## Troubleshooting

### Blur not working in Safari
Ensure you're using both `backdrop-filter` and `-webkit-backdrop-filter`:

```jsx
style={{
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}}
```

### Animations not smooth
1. Use `transform` and `opacity` instead of layout properties
2. Add `will-change-transform` class to animated elements
3. Ensure hardware acceleration is enabled

### Performance issues
1. Reduce number of blur layers
2. Use `will-change` sparingly
3. Implement virtual scrolling for long lists
4. Lazy load components when possible

## Best Practices

1. **Use glassmorphism sparingly** - Too many glass effects can hurt performance
2. **Maintain contrast** - Ensure text remains readable against glass backgrounds
3. **Test on real devices** - Glass effects can vary across devices
4. **Provide fallbacks** - Have solid backgrounds for browsers that don't support backdrop-filter
5. **Consider performance** - Glass effects are more expensive than solid backgrounds
6. **Accessibility first** - Always ensure content is accessible with or without visual effects

## License

This glassmorphic UI system is part of the SashaInfinity LMS platform.

## Support

For issues or questions about the glassmorphic UI system, please refer to the main project documentation or contact the development team.
