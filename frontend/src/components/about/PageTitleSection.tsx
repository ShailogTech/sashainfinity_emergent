import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutSections.module.css';

const PageTitleSection = () => {
  return (
    <section className={styles.pageTitleSection}>
      <div className={styles.container}>
        <h1>About Us</h1>
        <div className={styles.breadcrumbs}>
          <Link to="/">Sashainfinity</Link> <span>&gt;</span> About Us
        </div>
      </div>
    </section>
  );
};

export default PageTitleSection;
