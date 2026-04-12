import React from 'react';
import styles from './AboutSections.module.css';

const CoreOfferingsSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <p className={styles.preTitle}>💡 WHAT WE DO</p>
          <h2>Our Core Offerings</h2>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.icon}>🌐</div>
            <h3>Metaverse Learning Platform</h3>
            <p>A unified AR/VR learning ecosystem with interactive 3D models, simulations, and virtual classrooms.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.icon}>🏢</div>
            <h3>Hybrid Tutoring Centers</h3>
            <p>Physical + digital centers offering structured academic support with real-world applications.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.icon}>🚀</div>
            <h3>Skill Development Courses</h3>
            <p>On-demand learning for future-ready skills in collaboration with industry experts.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreOfferingsSection;
