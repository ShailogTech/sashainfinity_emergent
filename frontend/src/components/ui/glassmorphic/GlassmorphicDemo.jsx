import React from 'react';
import {
  GlassContainer,
  BentoGrid,
  BentoItem,
  GlassCard,
  GlassStatCard,
  GlassCourseCard,
  ParallaxSection,
  ParallaxLayer
} from './index';
import './GlassmorphicDemo.css';

/**
 * GlassmorphicDemo - Showcase component demonstrating the glassmorphic UI system
 *
 * This component demonstrates all the glassmorphic components in action.
 * Use it as a reference for implementing the UI system across your application.
 */
const GlassmorphicDemo = () => {
  const stats = [
    { value: '12,500+', label: 'Active Students', change: '+15%', changeType: 'positive', icon: '👨‍🎓' },
    { value: '450+', label: 'Courses Available', change: '+23', changeType: 'positive', icon: '📚' },
    { value: '98%', label: 'Success Rate', change: '+2%', changeType: 'positive', icon: '🎯' },
    { value: '4.9', label: 'Average Rating', change: '+0.3', changeType: 'positive', icon: '⭐' }
  ];

  const courses = [
    {
      title: 'Data Analytics Masterclass',
      instructor: 'Dr. Sarah Johnson',
      level: 'Intermediate',
      duration: '12 weeks',
      price: '₹29,999',
      progress: 75,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
    },
    {
      title: 'Full Stack Development',
      instructor: 'John Smith',
      level: 'Advanced',
      duration: '16 weeks',
      price: '₹39,999',
      progress: 45,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    },
    {
      title: 'React JS Mastery',
      instructor: 'Emily Chen',
      level: 'Beginner',
      duration: '8 weeks',
      price: '₹19,999',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
    }
  ];

  return (
    <div className="glassmorphic-demo">
      {/* Hero Section with Parallax */}
      <ParallaxSection speed={0.3} className="demo-hero">
        <div className="demo-hero-content">
          <GlassContainer variant="colored" blur={20} opacity={0.15}>
            <h1>Glassmorphic UI System</h1>
            <p>Modern, beautiful interface components for your LMS platform</p>
          </GlassContainer>
        </div>

        <ParallaxLayer depth={2} float={true}>
          <div className="floating-shape shape-1"></div>
        </ParallaxLayer>
        <ParallaxLayer depth={-1} float={true}>
          <div className="floating-shape shape-2"></div>
        </ParallaxLayer>
      </ParallaxSection>

      {/* Stats Section - Bento Grid */}
      <section className="demo-section">
        <h2>Dashboard Statistics</h2>
        <p className="demo-subtitle">Bento grid layout with glassmorphic stat cards</p>

        <BentoGrid columns={4} gap={24}>
          {stats.map((stat, index) => (
            <BentoItem key={index}>
              <GlassStatCard {...stat} />
            </BentoItem>
          ))}
        </BentoGrid>
      </section>

      {/* Card Variants Section */}
      <section className="demo-section">
        <h2>Glass Card Variants</h2>
        <p className="demo-subtitle">Different styles for various use cases</p>

        <BentoGrid columns={3} gap={24}>
          <BentoItem>
            <GlassCard
              variant="default"
              title="Default Card"
              subtitle="Basic glassmorphic style"
              icon="💎"
            >
              <p>This is the default glass card with subtle transparency and blur effects.</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="stat"
              title="Content Card"
              subtitle="For rich content display"
              icon="📝"
            >
              <p>Perfect for displaying articles, announcements, or detailed information.</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="colored"
              title="Featured Card"
              subtitle="With brand accent color"
              icon="⭐"
            >
              <p>Highlights important content with the brand's primary color scheme.</p>
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </section>

      {/* Course Cards Section */}
      <section className="demo-section">
        <h2>Course Cards</h2>
        <p className="demo-subtitle">Specialized cards for course listings</p>

        <BentoGrid columns={3} gap={24}>
          {courses.map((course, index) => (
            <BentoItem key={index}>
              <GlassCourseCard {...course} />
            </BentoItem>
          ))}
        </BentoGrid>
      </section>

      {/* Interactive Containers Section */}
      <section className="demo-section">
        <h2>Interactive Containers</h2>
        <p className="demo-subtitle">Click and hover to see effects</p>

        <BentoGrid columns={2} gap={24}>
          <BentoItem>
            <GlassContainer
              variant="light"
              hoverEffect="lift"
              interactive={true}
              onClick={() => alert('Container clicked!')}
            >
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>Lift on Hover</h3>
                <p>Hover over this container to see the lift effect</p>
                <button className="demo-button">Click Me</button>
              </div>
            </GlassContainer>
          </BentoItem>

          <BentoItem>
            <GlassContainer
              variant="colored"
              hoverEffect="glow"
              interactive={true}
            >
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>Glow on Hover</h3>
                <p>Hover over this container to see the glow effect</p>
              </div>
            </GlassContainer>
          </BentoItem>

          <BentoItem>
            <GlassContainer
              variant="dark"
              hoverEffect="scale"
              interactive={true}
            >
              <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <h3>Scale on Hover</h3>
                <p>Hover over this container to see the scale effect</p>
              </div>
            </GlassContainer>
          </BentoItem>

          <BentoItem>
            <GlassContainer
              variant="light"
              hoverEffect="none"
              interactive={false}
            >
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>No Hover Effect</h3>
                <p>This container has no hover interaction</p>
              </div>
            </GlassContainer>
          </BentoItem>
        </BentoGrid>
      </section>

      {/* Bento Grid Layout Examples */}
      <section className="demo-section">
        <h2>Bento Grid Layouts</h2>
        <p className="demo-subtitle">Flexible grid system for complex layouts</p>

        <BentoGrid columns={4} gap={20}>
          <BentoItem colSpan={2} rowSpan={2}>
            <GlassCard
              variant="colored"
              title="Large Feature"
              subtitle="Spans 2x2 grid cells"
              icon="🎯"
            >
              <p>This card demonstrates how to span multiple columns and rows in the bento grid.</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="default"
              title="Small Card 1"
              icon="1"
            >
              <p>1x1 card</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="default"
              title="Small Card 2"
              icon="2"
            >
              <p>1x1 card</p>
            </GlassCard>
          </BentoItem>

          <BentoItem colSpan={2}>
            <GlassCard
              variant="light"
              title="Wide Card"
              subtitle="Spans 2 columns"
              icon="📏"
            >
              <p>This card spans across two columns while taking one row.</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="default"
              title="Small Card 3"
              icon="3"
            >
              <p>1x1 card</p>
            </GlassCard>
          </BentoItem>

          <BentoItem>
            <GlassCard
              variant="default"
              title="Small Card 4"
              icon="4"
            >
              <p>1x1 card</p>
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </section>
    </div>
  );
};

export default GlassmorphicDemo;
