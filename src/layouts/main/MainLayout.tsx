import * as React from 'react';

// components
import { Breadcrumbs } from '../../components/breadcrumbs/Breadcrumbs';
import { Header } from '../../components/header/Header';
import { Menu } from '../../components/menu/Menu';

// styles
import * as styles from './MainLayout.scss';

interface IProps {
  className?: string;
}

export const MainLayout: React.SFC<IProps> = ({ children, className }) => (
  <div className={className}>
    <Header />
    <div className={styles.container}>
      <Menu />
      <div className={styles.content}>
        <Breadcrumbs />
        {children}
      </div>
    </div>
  </div>
);
