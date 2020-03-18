import * as React from 'react';

import classNames from 'classnames';

import styles from './PageHeader.scss';

interface IProps {
  header: string;
  styleOverride?: string;
}

export const PageHeader: React.FC<IProps> = ({
  children,
  header,
  styleOverride
}) => (
  <div className={classNames(styles.base, styleOverride)}>
    <h1 className={styles.heading}>{header}</h1>
    <div>{children}</div>
  </div>
);
