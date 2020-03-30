import * as React from 'react';
import { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../';

import styles from './ButtonLink.scss';

interface IProps {
  page:
    | 'groups'
    | 'groups/new'
    | 'services'
    | 'services/edit'
    | 'services/new'
    | 'users'
    | 'users/edit'
    | 'users/new';
  onClick?: MouseEventHandler;
}

export const ButtonLink: React.FC<IProps> = ({ children, page, onClick }) => (
  <Link className={styles.link} onClick={onClick} to={`/${page}`}>
    <Button styleOverride={styles.button}>{children}</Button>
  </Link>
);
