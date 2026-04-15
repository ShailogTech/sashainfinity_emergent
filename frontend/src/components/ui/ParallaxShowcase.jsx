import React from 'react';
import ParallaxContainer from './ParallaxContainer';
import GlassCard from './GlassCard';
import BentoBox from './BentoBox';

/**
 * ParallaxShowcase - Demonstrates advanced parallax effects
 * with the glassmorphic UI system
 */
const ParallaxShowcase = () => {
  const features = [
    {
      icon: '🎨',
      title: 'Layered Parallax',
      description: 'Multiple layers moving at different speeds create depth perception',
      depth: 0.2,
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Seamless experience across all device sizes',
      depth: 0.4,
    },
    {
      icon: '⚡',
      title: 'Performance First',
      description: 'Hardware-accelerated animations for smooth 60fps',
      depth: 0.6,
    },
    {
      icon: '✨',
      title: 'Beautiful Effects',
      description: 'Stunning visual effects that enhance user experience',
      depth: 0.3,
    },
  ];

  const stats = [
    { value: '60fps', label: 'Frame Rate', color: '#f4911a' },
    { value: '100%', label: 'Responsive', color: '#667eea' },
    { value: 'A11Y', label: 'Accessible', color: '#2dd472' },
    { value: 'GSAP', label: 'Powered By', color: '#f5576c' },
  ];

  return (
    <div style={{
      padding: '80px 0',
      background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(244, 145, 26, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px',
          position: 'relative',
          zIndex: 1,
        }}>
          <ParallaxContainer.Reveal animation="fadeUp">
            <h2 style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#1a1a2e',
              marginBottom: '16px',
              letterSpacing: '-1.5px',
            }}>
              Advanced Parallax Effects
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.7',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Experience smooth, performant scroll animations that create depth and engage users
            </p>
          </ParallaxContainer.Reveal>
        </div>

        {/* Layered Parallax Section */}
        <div style={{
          position: 'relative',
          height: '400px',
          marginBottom: '80px',
          perspective: '1000px',
        }}>
          {/* Background layer - moves slowest */}
          <ParallaxContainer.Layer depth={0.2}>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GlassCard
                variant="default"
                size="xl"
                gradient
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  minHeight: '300px',
                  opacity: 0.5,
                }}
              >
                <div style={{
                  fontSize: '120px',
                  fontWeight: 900,
                  color: 'rgba(244, 145, 26, 0.1)',
                  fontFamily: "Lexend Deca, sans-serif",
                }}>
                  PARALLAX
                </div>
              </GlassCard>
            </div>
          </ParallaxContainer.Layer>

          {/* Middle layer - medium speed */}
          <ParallaxContainer.Layer depth={0.5}>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GlassCard
                variant="secondary"
                size="lg"
                gradient
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  minHeight: '250px',
                  opacity: 0.7,
                }}
              >
                <div style={{
                  fontSize: '72px',
                  fontWeight: 800,
                  color: 'rgba(8, 42, 94, 0.15)',
                  fontFamily: "Lexend Deca, sans-serif",
                }}>
                  SCROLL
                </div>
              </GlassCard>
            </div>
          </ParallaxContainer.Layer>

          {/* Front layer - moves fastest */}
          <ParallaxContainer.Layer depth={0.8}>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GlassCard
                variant="primary"
                size="md"
                gradient
                hoverable
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: '#f4911a',
                    fontFamily: "Lexend Deca, sans-serif",
                    marginBottom: '8px',
                  }}>
                    DEPTH
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: 600,
                  }}>
                    Multiple layers create 3D effect
                  </div>
                </div>
              </GlassCard>
            </div>
          </ParallaxContainer.Layer>
        </div>

        {/* Feature Cards with Staggered Reveal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '80px',
        }}>
          {features.map((feature, index) => (
            <ParallaxContainer.Reveal
              key={index}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <ParallaxContainer.Tilt maxTilt={10}>
                <GlassCard
                  variant="accent"
                  size="lg"
                  hoverable
                  gradient
                  style={{ height: '100%' }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '16px',
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '8px',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#667eea',
                    fontWeight: 600,
                  }}>
                    Depth: {feature.depth}
                  </div>
                </GlassCard>
              </ParallaxContainer.Tilt>
            </ParallaxContainer.Reveal>
          ))}
        </div>

        {/* Stats Section with Different Animations */}
        <div style={{
          marginBottom: '80px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <ParallaxContainer.Reveal animation="fadeIn" delay={0}>
              <GlassCard
                variant="primary"
                size="md"
                hoverable
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#f4911a',
                  fontFamily: "Lexend Deca, sans-serif",
                  marginBottom: '8px',
                }}>
                  {stats[0].value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {stats[0].label}
                </div>
              </GlassCard>
            </ParallaxContainer.Reveal>

            <ParallaxContainer.Reveal animation="fadeIn" delay={0.1}>
              <GlassCard
                variant="accent"
                size="md"
                hoverable
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#667eea',
                  fontFamily: "Lexend Deca, sans-serif",
                  marginBottom: '8px',
                }}>
                  {stats[1].value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {stats[1].label}
                </div>
              </GlassCard>
            </ParallaxContainer.Reveal>

            <ParallaxContainer.Reveal animation="fadeIn" delay={0.2}>
              <GlassCard
                variant="success"
                size="md"
                hoverable
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#2dd472',
                  fontFamily: "Lexend Deca, sans-serif",
                  marginBottom: '8px',
                }}>
                  {stats[2].value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {stats[2].label}
                </div>
              </GlassCard>
            </ParallaxContainer.Reveal>

            <ParallaxContainer.Reveal animation="fadeIn" delay={0.3}>
              <GlassCard
                variant="warning"
                size="md"
                hoverable
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#f5576c',
                  fontFamily: "Lexend Deca, sans-serif",
                  marginBottom: '8px',
                }}>
                  {stats[3].value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {stats[3].label}
                </div>
              </GlassCard>
            </ParallaxContainer.Reveal>
          </div>
        </div>

        {/* Interactive Tilt Cards Section */}
        <div style={{
          marginBottom: '80px',
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a2e',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            Interactive 3D Tilt Cards
          </h3>

          <BentoBox gap={24}>
            <BentoBox.Item>
              <ParallaxContainer.Tilt maxTilt={20}>
                <GlassCard
                  variant="primary"
                  size="lg"
                  gradient
                  hoverable
                  style={{ height: '100%', minHeight: '200px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      marginBottom: '8px',
                    }}>
                      Max Tilt: 20°
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      Maximum rotation angle
                    </p>
                  </div>
                </GlassCard>
              </ParallaxContainer.Tilt>
            </BentoBox.Item>

            <BentoBox.Item>
              <ParallaxContainer.Tilt maxTilt={10}>
                <GlassCard
                  variant="secondary"
                  size="lg"
                  gradient
                  hoverable
                  style={{ height: '100%', minHeight: '200px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      marginBottom: '8px',
                    }}>
                      Max Tilt: 10°
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      Subtle rotation effect
                    </p>
                  </div>
                </GlassCard>
              </ParallaxContainer.Tilt>
            </BentoBox.Item>

            <BentoBox.Item>
              <ParallaxContainer.Tilt maxTilt={5}>
                <GlassCard
                  variant="accent"
                  size="lg"
                  gradient
                  hoverable
                  style={{ height: '100%', minHeight: '200px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      marginBottom: '8px',
                    }}>
                      Max Tilt: 5°
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      Minimal rotation effect
                    </p>
                  </div>
                </GlassCard>
              </ParallaxContainer.Tilt>
            </BentoBox.Item>
          </BentoBox>
        </div>

        {/* Horizontal Parallax Section */}
        <div style={{
          position: 'relative',
          height: '300px',
          marginBottom: '80px',
          overflow: 'hidden',
          borderRadius: '24px',
        }}>
          <ParallaxContainer speed={0.3} direction="horizontal">
            <div style={{
              display: 'flex',
              gap: '24px',
              padding: '24px',
            }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <GlassCard
                  key={num}
                  variant="default"
                  size="md"
                  style={{
                    minWidth: '250px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#f4911a',
                      fontFamily: "Lexend Deca, sans-serif",
                      marginBottom: '8px',
                    }}>
                      {num}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: 600,
                    }}>
                      Horizontal Scroll
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </ParallaxContainer>
        </div>

        {/* Call to Action */}
        <ParallaxContainer.Reveal animation="scale">
          <GlassCard
            variant="primary"
            size="xl"
            gradient
            hoverable
            style={{
              textAlign: 'center',
              padding: '60px',
            }}
          >
            <h3 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#1a1a2e',
              marginBottom: '16px',
            }}>
              Ready to Build Something Amazing?
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}>
              This glassmorphic UI system is ready to use in your next project.
              Beautiful, performant, and fully accessible.
            </p>
            <button style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #f4911a 0%, #ffaa44 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 145, 26, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              Get Started
            </button>
          </GlassCard>
        </ParallaxContainer.Reveal>
      </div>
    </div>
  );
};

export default ParallaxShowcase;
