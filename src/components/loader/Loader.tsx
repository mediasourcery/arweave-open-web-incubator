import * as React from 'react';

import { Icon } from '..';

import styles from './Loader.scss';

export const Loader: React.FC = () => (
  <div
    className={styles.loader}
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
