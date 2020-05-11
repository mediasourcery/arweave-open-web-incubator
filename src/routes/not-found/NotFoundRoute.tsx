import * as React from 'react';
import { FC, useContext, useEffect } from 'react';

import { ContentBox } from '../../components';
import { BreadcrumbsContext, PageContext } from '../../contexts';

import styles from './NotFoundRoute.scss';

export const NotFoundRoute: FC = () => {
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  useEffect(() => {
    setPage('404');
    setBreadcrumbs([
      {
        text: '',
        url: ''
      }
    ]);
  }, []);

  return (
    <ContentBox>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Page Not Found</h2>
      <p className={styles.notice}>
        The page you are looking for does not exist.
        </p>
      <a href='/'><p className={styles.homeLink}>Return Home</p></a>
    </ContentBox>
  );
};
