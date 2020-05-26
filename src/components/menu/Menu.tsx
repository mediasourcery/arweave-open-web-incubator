import classNames from 'classnames';
import * as React from 'react';
import { useContext } from 'react';

import { MenuLink } from '../';

import { MenuContext, PageContext } from '../../contexts';

import styles from './Menu.scss';

const mainNavLinks: {
  page: 'upload' | 'documents';
  displayName: string;
}[] = [
  {
    page: 'documents',
    displayName: 'Documents'
  },
  {
    page: 'upload',
    displayName: 'File Upload'
  }
];

export const Menu: React.FunctionComponent = () => {
  const { showMenu, setShowMenu } = useContext(MenuContext);
  const { page } = useContext(PageContext);

  return (
    <>
      <button
        className={classNames(styles.overlay, showMenu ? styles.show : null)}
        onClick={() => setShowMenu(!showMenu)}
      />
      <nav className={classNames(styles.menu, showMenu ? styles.show : null)}>
        <h3 className={styles.heading}>Access Control</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            {mainNavLinks.map(info => (
              <MenuLink
                key={info.page}
                page={info.page}
                displayName={info.displayName}
                currentPage={page}
                onClick={() => setShowMenu(false)}
              />
            ))}
          </li>
        </ul>
      </nav>
    </>
  );
};
