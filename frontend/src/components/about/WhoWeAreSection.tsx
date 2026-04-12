import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutSections.module.css';

const WhoWeAreSection = () => {
  return (
    <section className={`${styles.section} ${styles.whoWeAreHero}`}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.textContent}>
            <p className={styles.preTitle}>✨ WHO WE ARE</p>
            <h2>
              The Leading Global <span className={styles.highlightOrange}>Marketplace</span> For Learning And <span className={styles.highlightBlue}>Instruction</span>
            </h2>
            <p>
              SashaInfinity is an edtech reimagining the future of learning through immersive AR/VR experiences,
              hybrid tutoring centers, and data-driven personalized education for K12 and college students across India.
            </p>
            <Link to="/courses" className={styles.btn}>EXPLORE COURSES</Link>
          </div>
          <div className={styles.imageContent}>
            <img
              src="https://sashainfinity.com/wp-content/uploads/2025/06/Copy_of_sasha_SISF_PITCH-removebg-preview-e1751282895734.png"
              alt="Children happily learning with VR headsets"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
