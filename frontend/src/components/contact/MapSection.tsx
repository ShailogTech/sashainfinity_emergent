import React from 'react';
import styles from './MapSection.module.css';

const MapSection = () => {
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.411634732128!2d78.1158586748232!3d11.66613328859943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf016e780a53f%3A0x6b44a470123955e8!2sSashainfinity!5e0!3m2!1sen!2sin!4v1721389868770!5m2!1sen!2sin";

  return (
    <section className={styles.mapSection}>
      <iframe
        src={mapSrc}
        width="600"
        height="450"
        className={styles.mapFrame}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Sashainfinity Location"
      ></iframe>
    </section>
  );
};

export default MapSection;
