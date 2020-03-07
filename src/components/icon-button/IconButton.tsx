import classNames from 'classnames';
import * as React from 'react';

import styles from './IconButton.scss';

interface IProps {
  className?: string;
  disabled?: boolean;
  image: string;
  onClick?: () => void;
  size?: number;
  title?: string;
  type?: 'button' | 'submit';
}

export const IconButton: React.FC<IProps> = ({
  className = '',
  disabled = false,
  image,
  onClick = () => {},
  size = 24,
  title = '',
  type = 'button'
}) => (
  <button
    className={classNames(styles.icon, className)}
    disabled={disabled}
    onClick={onClick}
    style={{
      backgroundImage: `url(${process.env.PUBLIC_URL}${image})`,
      height: `${size}px`,
      width: `${size}px`
    }}
    title={title}
    type={type}
  />
);
