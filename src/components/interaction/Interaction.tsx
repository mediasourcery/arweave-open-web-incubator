import * as React from 'react';

import classNames from 'classnames';

import styles from './Interaction.scss';

interface IProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const Interaction: React.FC<IProps> = ({
  children,
  className,
  disabled = false,
  onClick = () => {}
}) => (
  <button
    className={classNames(className, styles.button)}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
