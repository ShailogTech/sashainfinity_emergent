import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardBody,
  GlassCardFooter,
  GlassStatCard,
  GlassProgressCard,
} from '@/components/ui/glass-card';
import {
  BentoGrid,
  BentoItem,
  BentoGridSection,
} from '@/components/ui/bento-grid';
import {
  ParallaxContainer,
  ParallaxLayer,
  ParallaxTilt,
  ParallaxScrollTrigger,
} from '@/components/ui/parallax-container';
import './GlassmorphicDemo.css';

/**
 * GlassmorphicDemo - A comprehensive showcase of the glassmorphic design system
 *
 * This page demonstrates:
 * - All glass card variants (default, primary, secondary, dark, gradient, etc.)
 * - Bento grid layouts with different configurations
 * - Parallax effects (scroll, mouse, tilt)
 * - Progress indicators (circular and linear)
 * - Stat cards with change indicators
 * - Interactive hover effects
 */
const GlassmorphicDemo = () => {
  // Sample data for demo
  const stats = [
    { value: '12,500+', label: 'Active Students', change: '+15%', changeType: 'positive', icon: '👨‍🎓' },
    { value: '450+', label: 'Courses Available', change: '+23', changeType: 'positive', icon: '📚' },
    { value: '98%', label: 'Success Rate', change: '+2%', changeType: 'positive', icon: '🎯' },
    { value: '4.9', label: 'Average Rating', change: '+0.3', changeType: 'positive', icon: '⭐' },
  ];

  const features = [
    { title: 'Glassmorphic Design', description: 'Beautiful frosted glass effects with backdrop blur', icon: '💎' },
    { title: 'Bento Grid Layouts', description: 'Flexible CSS Grid system for complex dashboard layouts', icon: '📐' },
    { title: 'Parallax Effects', description: 'Smooth scroll and mouse-based parallax animations', icon: '🌀' },
    { title: 'Progress Tracking', description: 'Circular and linear progress indicators', icon: '📊' },
    { title: 'Interactive Cards', description: 'Hover effects with shimmer and glow animations', icon: '✨' },
    { title: 'Responsive Design', description: 'Mobile-first approach with breakpoints', icon: '📱' },
  ];

  const cardVariants = [
    { variant: 'default', title: 'Default Card', description: 'Clean white glass effect with subtle transparency' },
    { variant: 'primary', title: 'Primary Card', description: 'Orange accent with brand colors' },
    { variant: 'secondary', title: 'Secondary Card', description: 'Navy blue accent for professional look' },
    { variant: 'accent', title: 'Accent Card', description: 'Purple accent for highlighted content' },
    { variant: 'success', title: 'Success Card', description: 'Green accent for positive feedback' },
    { variant: 'warning', title: 'Warning Card', description: 'Red accent for alerts and warnings' },
  ];

  return (
    <div className="glassmorphic-demo">
      {/* Hero Section with Parallax */}
      <section className="demo-hero">
        <ParallaxContainer speed={0.3} className="hero-parallax">
          <div className="hero-content">
            <ParallaxScrollTrigger animation="fade-up">
              <motion.div
                className="hero-badge"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                ✨ New Design System
              </motion.div>
            </ParallaxScrollTrigger>

            <ParallaxScrollTrigger animation="fade-up" delay={100}>
              <h1>Glassmorphic UI</h1>
            </ParallaxScrollTrigger>

            <ParallaxScrollTrigger animation="fade-up" delay={200}>
              <p className="hero-description">
                A comprehensive design system featuring frosted glass effects,
                bento-grid layouts, and smooth parallax animations.
                Built for modern learning platforms.
              </p>
            </ParallaxScrollTrigger>

            <ParallaxScrollTrigger animation="fade-up" delay={300}>
              <div className="hero-actions">
                <Link to="/dashboard" className="hero-btn primary">
                  View Dashboard
                </Link>
                <a href="#components" className="hero-btn secondary">
                  Explore Components
                </a>
              </div>
            </ParallaxScrollTrigger>
          </div>

          {/* Floating Parallax Layers */}
          <ParallaxLayer depth={2} float={true} floatDuration={8}>
            <div className="floating-shape shape-1" />
          </ParallaxLayer>
          <ParallaxLayer depth={-1} float={true} floatDuration={10}>
            <div className="floating-shape shape-2" />
          </ParallaxLayer>
          <ParallaxLayer depth={1} float={true} floatDuration={12}>
            <div className="floating-shape shape-3" />
          </ParallaxLayer>
        </ParallaxContainer>
      </section>

      {/* Stats Section */}
      <section className="demo-section">
        <BentoGridSection
          title="Dashboard Statistics"
          subtitle="Glassmorphic stat cards with change indicators"
        >
          <BentoGrid columns={4} gap={20} animation="fade">
            {stats.map((stat, index) => (
              <BentoItem key={index}>
                <ParallaxScrollTrigger animation="fade-up" delay={index * 100}>
                  <GlassStatCard {...stat} />
                </ParallaxScrollTrigger>
              </BentoItem>
            ))}
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Card Variants Section */}
      <section id="components" className="demo-section">
        <BentoGridSection
          title="Glass Card Variants"
          subtitle="Multiple visual styles for different use cases"
        >
          <BentoGrid columns={3} gap={24}>
            {cardVariants.map((card, index) => (
              <BentoItem key={card.variant}>
                <ParallaxScrollTrigger animation="fade-up" delay={index * 100}>
                  <ParallaxTilt maxRotate={3}>
                    <GlassCard
                      variant={card.variant}
                      size="md"
                      hoverable
                      shimmer
                    >
                      <GlassCardHeader
                        title={card.title}
                        icon={<div className="card-icon-emoji">{card.icon}</div>}
                      />
                      <GlassCardBody>
                        <p>{card.description}</p>
                      </GlassCardBody>
                      <GlassCardFooter>
                        <button className="demo-link-btn">Learn more →</button>
                      </GlassCardFooter>
                    </GlassCard>
                  </ParallaxTilt>
                </ParallaxScrollTrigger>
              </BentoItem>
            ))}
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Features Grid */}
      <section className="demo-section">
        <BentoGridSection
          title="Key Features"
          subtitle="What makes this design system special"
        >
          <BentoGrid columns={3} gap={20} animation="fade">
            {features.map((feature, index) => (
              <BentoItem key={index}>
                <ParallaxScrollTrigger animation="fade-up" delay={index * 80}>
                  <GlassCard variant="default" size="md" hoverable>
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </GlassCard>
                </ParallaxScrollTrigger>
              </BentoItem>
            ))}
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Progress Cards */}
      <section className="demo-section">
        <BentoGridSection
          title="Progress Indicators"
          subtitle="Circular and linear progress components"
        >
          <BentoGrid columns={4} gap={20}>
            <BentoItem>
              <GlassProgressCard
                title="Course Progress"
                progress={18}
                total={24}
                type="circular"
                variant="primary"
              />
            </BentoItem>
            <BentoItem>
              <GlassProgressCard
                title="Weekly Goal"
                progress={5}
                total={7}
                type="circular"
                variant="success"
              />
            </BentoItem>
            <BentoItem>
              <GlassProgressCard
                title="Assessment"
                progress={85}
                total={100}
                type="linear"
                variant="accent"
              />
            </BentoItem>
            <BentoItem>
              <GlassProgressCard
                title="Hours Learned"
                progress={42}
                total={50}
                type="linear"
                variant="default"
              />
            </BentoItem>
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Bento Layout Examples */}
      <section className="demo-section">
        <BentoGridSection
          title="Bento Grid Layouts"
          subtitle="Flexible grid system for complex layouts"
        >
          <BentoGrid columns={4} gap={20} animation="fade">
            <BentoItem colSpan={2} rowSpan={2}>
              <ParallaxScrollTrigger animation="fade-up">
                <GlassCard variant="gradient" size="lg" hoverable className="featured-layout-card">
                  <div className="featured-badge">Featured</div>
                  <h2>Large Featured Card</h2>
                  <p>This card spans 2 columns and 2 rows, perfect for highlighting important content.</p>
                  <div className="featured-stats">
                    <div className="stat">
                      <span className="stat-value">2x2</span>
                      <span className="stat-label">Grid Span</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">Auto</span>
                      <span className="stat-label">Responsive</span>
                    </div>
                  </div>
                </GlassCard>
              </ParallaxScrollTrigger>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="default" size="md" hoverable>
                <div className="mini-card-icon">1</div>
                <h4>Small Card</h4>
                <p>1x1 grid cell</p>
              </GlassCard>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="primary" size="md" hoverable>
                <div className="mini-card-icon">2</div>
                <h4>Small Card</h4>
                <p>1x1 grid cell</p>
              </GlassCard>
            </BentoItem>

            <BentoItem colSpan={2}>
              <GlassCard variant="secondary" size="md" hoverable>
                <h4>Wide Card</h4>
                <p>Spans 2 columns, 1 row - great for horizontal content</p>
              </GlassCard>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="accent" size="md" hoverable>
                <div className="mini-card-icon">3</div>
                <h4>Small Card</h4>
                <p>1x1 grid cell</p>
              </GlassCard>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="success" size="md" hoverable>
                <div className="mini-card-icon">4</div>
                <h4>Small Card</h4>
                <p>1x1 grid cell</p>
              </GlassCard>
            </BentoItem>
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Interactive Parallax Section */}
      <section className="demo-section parallax-demo-section">
        <BentoGridSection
          title="Interactive Parallax"
          subtitle="Move your mouse over the cards to see the 3D tilt effect"
        >
          <BentoGrid columns={3} gap={24}>
            <BentoItem>
              <ParallaxTilt maxRotate={10} scale={1.05} glare>
                <GlassCard variant="primary" size="lg" className="tilt-demo-card">
                  <h3>3D Tilt Effect</h3>
                  <p>Move your mouse over this card to see the 3D perspective tilt effect with glare.</p>
                </GlassCard>
              </ParallaxTilt>
            </BentoItem>

            <BentoItem>
              <ParallaxTilt maxRotate={5} scale={1.02}>
                <GlassCard variant="accent" size="lg" className="tilt-demo-card">
                  <h3>Subtle Tilt</h3>
                  <p>Lower rotation intensity for a more refined interaction effect.</p>
                </GlassCard>
              </ParallaxTilt>
            </BentoItem>

            <BentoItem>
              <ParallaxTilt maxRotate={15} scale={1.08} glare glareColor="rgba(244, 145, 26, 0.4)">
                <GlassCard variant="gradient" size="lg" className="tilt-demo-card">
                  <h3>High Intensity</h3>
                  <p>Maximum rotation with enhanced glare effect for dramatic feel.</p>
                </GlassCard>
              </ParallaxTilt>
            </BentoItem>
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* Dark Mode Preview */}
      <section className="demo-section dark-preview-section">
        <BentoGridSection
          title="Dark Mode Ready"
          subtitle="Components adapt beautifully to dark backgrounds"
        >
          <BentoGrid columns={3} gap={24}>
            <BentoItem>
              <GlassCard variant="dark" size="md" hoverable>
                <h3>Dark Card</h3>
                <p>Dark glass effect with reduced opacity for elegant dark themes.</p>
              </GlassCard>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="dark" size="md" hoverable shimmer>
                <h3>With Shimmer</h3>
                <p>Dark card with shimmer hover effect for extra polish.</p>
              </GlassCard>
            </BentoItem>

            <BentoItem>
              <GlassCard variant="dark" size="md" hoverable gradient>
                <h3>Gradient Dark</h3>
                <p>Dark card with gradient overlay for depth.</p>
              </GlassCard>
            </BentoItem>
          </BentoGrid>
        </BentoGridSection>
      </section>

      {/* CTA Section */}
      <section className="demo-cta-section">
        <ParallaxContainer speed={0.2}>
          <GlassCard variant="gradient" size="xl" className="cta-card">
            <div className="cta-content">
              <h2>Ready to Build Something Beautiful?</h2>
              <p>
                Start using the glassmorphic design system in your project today.
                All components are production-ready and fully customizable.
              </p>
              <div className="cta-actions">
                <Link to="/dashboard" className="cta-btn primary">
                  View Dashboard Demo
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn secondary"
                >
                  Documentation
                </a>
              </div>
            </div>

            {/* Decorative floating elements */}
            <div className="cta-decoration">
              <div className="cta-circle circle-1" />
              <div className="cta-circle circle-2" />
              <div className="cta-circle circle-3" />
            </div>
          </GlassCard>
        </ParallaxContainer>
      </section>
    </div>
  );
};

export default GlassmorphicDemo;
