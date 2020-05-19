import * as React from 'react';
import { FC } from 'react';

import { ContentBox } from '../../components';

import styles from './NotFoundRoute.scss';

export const NotFoundRoute: FC = () => (
    <ContentBox>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Page Not Found</h2>
      <p className={styles.notice}>
        The page you are looking for does not exist.
        </p>
      <a href='/'><p className={styles.homeLink}>Return Home</p></a>
    </ContentBox>
  );
