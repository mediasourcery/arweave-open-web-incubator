import classNames from 'classnames';
import * as React from 'react';
import { Icon } from '..';
import styles from './Loader.scss';

interface IProps {
  className?: string;
  showText?: boolean;
}

export const Loader: React.FC<IProps> = ({ className, showText }) => (
  <div className={classNames(className, styles.loader)}>
    <div className={styles.loaderImageContainer}>
      <Icon image="icons/loader.svg" />
    </div>
    {showText && <div className={styles.text}>Loading...</div>}
  </div>
);
