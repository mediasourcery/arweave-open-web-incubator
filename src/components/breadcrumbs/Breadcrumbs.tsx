import * as React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { BreadcrumbsContext, PageContext } from '../../contexts';

import styles from './Breadcrumbs.scss';

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useContext(BreadcrumbsContext);
  const { page } = useContext(PageContext)

  if (page === '404') {
    return null
  }

  return (
    <ul className={styles.breadcrumbs}>
      {breadcrumbs.map(breadcrumb => (
        <li className={styles.breadcrumb} key={breadcrumb.url}>
          <Link className={styles.link} to={`/${breadcrumb.url}`}>
            {breadcrumb.text}
          </Link>
        </li>
      ))}
    </ul>
  );
};
