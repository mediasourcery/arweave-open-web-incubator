import * as React from 'react';
import { useContext } from 'react';
import { Link } from '@reach/router';

import { BreadcrumbsContext } from '../../contexts';

import styles from './Breadcrumbs.scss';

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useContext(BreadcrumbsContext);

  return (
    <ul
      className={styles.breadcrumbs}
    >
      {breadcrumbs.map((breadcrumb) => (
        <li className={styles.breadcrumb} key={breadcrumb.url}>
          <Link
            className={styles.link}
            to={`${process.env.PUBLIC_URL}${breadcrumb.url}`}
          >
            {breadcrumb.text}
          </Link>
        </li>
      ))}
    </ul>
  );
};
