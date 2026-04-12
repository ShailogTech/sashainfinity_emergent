import React from 'react';
import styles from './AboutSections.module.css';

const StatsSection = () => {
  return (
    <section className={`${styles.section} ${styles.statsSection}`}>
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <p className={styles.preTitle}>OUR IMPACT</p>
          <h2>Grow Your Skills To Advance<br />Your Career Path</h2>
        </div>
        <div className={styles.statsWrapper}>
          <div className={styles.statCard}>
            <div className={styles.icon}>🎓</div>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>Students Enrolled</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.icon}>🌟</div>
            <div className={styles.statNumber}>30+</div>
            <div className={styles.statLabel}>Certified</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
