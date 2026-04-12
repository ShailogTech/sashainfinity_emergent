import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './PageHeader.module.css';

interface Breadcrumb {
  name: string;
  path: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs }) => {
  return (
    <section className={styles.pageHeader}>
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <Link to={crumb.path} className={styles.crumbLink}>
                  {crumb.name}
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <span className={styles.separator}>
                    <ChevronRight size={12} />
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
