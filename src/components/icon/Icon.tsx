import classNames from 'classnames';
import * as React from 'react';

import styles from './Icon.scss';

interface IProps {
  className?: string;
  image: string;
  size?: number;
  title?: string;
}

export const Icon: React.FC<IProps> = ({
  className = '',
  image,
  size = 24,
  title = ''
}) => {
  console.log(image);
  return (
    <span
      className={classNames(styles.icon, className)}
      style={{
        backgroundImage: /^https?:/.test(image)
          ? `url(${image})`
          : `url(${process.env.PUBLIC_URL}${image})`,
        height: `${size}px`,
        width: `${size}px`
      }}
      title={title}
    />
  );
};
