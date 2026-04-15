/**
 * Glassmorphic UI Components Index
 *
 * A comprehensive design system with glassmorphic styling,
 * bento-grid layouts, and parallax effects.
 *
 * @example
 * import { GlassCard, BentoGrid, ParallaxContainer } from '@/components/ui/glassmorphic';
 */

// Glass Card Components
export { default as GlassCard } from '../glass-card';
export {
  GlassCardHeader,
  GlassCardBody,
  GlassCardFooter,
  GlassStatCard,
  GlassProgressCard,
} from '../glass-card';

// Bento Grid Components
export { default as BentoGrid, BentoItem } from '../bento-grid';
export {
  BentoGridSection,
  DashboardLayout,
  StatsLayout,
  FeaturedLayout,
} from '../bento-grid';

// Parallax Components
export {
  default as ParallaxContainer,
  ParallaxLayer,
  ParallaxTilt,
  ParallaxScrollTrigger,
} from '../parallax-container';

// Legacy exports (for backwards compatibility)
export { default as GlassContainer } from './GlassContainer';
export { default as ParallaxSection } from './ParallaxSection';
