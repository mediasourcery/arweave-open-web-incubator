import * as React from 'react';

import classNames from 'classnames';

import styles from './ContentBox.scss';

interface IProps {
  styleOverride?: string;
}

export const ContentBox: React.FC<IProps> = ({ children, styleOverride }) => (
  <div className={classNames(styles.box, styleOverride)}>{children}</div>
);
