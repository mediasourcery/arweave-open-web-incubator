import * as React from 'react';
import classNames from 'classnames';

import { Icon } from '..';

import styles from './Loader.scss';

interface IProps {
  className?: string;
}

export const Loader: React.FC<IProps> = ({ className }) => (
  <div
    className={classNames(className, styles.loader)}
  >
    <div className={styles.loaderImageContainer}>
      <Icon
        image="icons/loader.svg"
      />
    </div>
    <div className={styles.text}>
      Loading...
    </div>
  </div>
);
