import * as React from 'react';
import { Link } from 'react-router-dom';

import styles from './Error404Route.scss';

export const Error404Route: React.FunctionComponent = () => (
  <div className={styles.container}>
    <div>
      <h1 className={styles.header}>404</h1>
      <h1 className={styles.subheader}>Page Not Found</h1>
      <Link className={styles.text} to="/">
        <p>Return to Home page</p>
      </Link>
    </div>
  </div>
);
