import * as React from 'react';
import * as blockstack from 'blockstack';
import { putFile } from 'blockstack';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { Loader, Button, ContentBox, PageHeader } from '../../components';
import { BreadcrumbsContext, PageContext } from '../../contexts';
import { redirectToLogin } from '../../utils';
import { decodeToken } from '../../utils';

import styles from './NotFoundRoute.scss';

export const NotFoundRoute: FC = () => {
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  useEffect(() => {
    setPage('');
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
    </ContentBox>
  );
};
