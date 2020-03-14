import * as React from 'react';

import classNames from 'classnames';

import styles from './Button.scss';

interface IProps {
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  styleOverride?: string;
  className?: string;
}

export const Button: React.FC<IProps> = ({
  children,
  disabled = false,
  onClick = () => {},
  type = 'button',
  styleOverride,
  className
}) => (
  <button
    className={classNames(className, styles.button, styleOverride)}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {children}
  </button>
);
