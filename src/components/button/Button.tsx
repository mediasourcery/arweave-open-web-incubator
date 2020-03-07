import * as React from 'react';

import classNames from 'classnames';

import styles from './Button.scss';

interface IProps {
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  styleOverride?: string;
}

export const Button: React.FC<IProps> = ({
  children,
  disabled = false,
  onClick = () => {},
  type = 'button',
  styleOverride,
}) => (
  <button
    className={classNames(styles.button, styleOverride)}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {children}
  </button>
);
