import classNames from 'classnames';
import * as React from 'react';
import { MouseEventHandler } from 'react';
import { Link } from '@reach/router';

import { Icon } from '../';

import styles from './MenuLink.scss';

interface IProps {
  page: 'upload' | 'documents';
  displayName: string;
  currentPage: string;
  onClick: MouseEventHandler;
}

export const MenuLink: React.FC<IProps> = ({
  page,
  displayName,
  currentPage,
  onClick
}) => (
  <Link
    className={classNames(
      styles.link,
      currentPage === page ? styles.active : null
    )}
    onClick={onClick}
    to={`${process.env.PUBLIC_URL}${page}`}
  >
    <Icon image={`icons/${page}-white.svg`} size={16} />
    <span className={styles.text}>{displayName}</span>
  </Link>
);
