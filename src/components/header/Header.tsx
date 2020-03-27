import * as crypto from 'crypto';
import * as React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { Icon, IconButton } from '..';

import { MenuContext, PopoverContext } from '../../contexts';
import { decodeToken } from '../../utils';

import styles from './Header.scss';

export const Header: React.FunctionComponent = () => {
  const token = decodeToken(sessionStorage.getItem('token'));

  const { showMenu, setShowMenu } = useContext(MenuContext);
  const { setPopoverItems, showPopover, setShowPopover } = useContext(
    PopoverContext
  );

  const emailIdentifier = token.identifiers.find(
    identifier => identifier.type === 'email'
  );
  const email = emailIdentifier ? emailIdentifier.value : '';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Link
          className={styles.titleLink}
          onClick={() => setShowMenu(false)}
          to="/"
        >
          <Icon image="icons/auth-icon.svg" size={32} />
          <span className={styles.text}>Doc Uploader v1.0</span>
        </Link>
      </h1>
      <div className={styles.spacer} />
      <div className={styles.menuButtonContainer}>
        <IconButton
          image="icons/menu.svg"
          onClick={() => setShowMenu(!showMenu)}
          size={32}
        />
      </div>
      <div className={styles.userName}>{token.sub}</div>
      <div className={styles.user}>
        <button
          className={styles.userButton}
          onMouseDown={event => {
            event.stopPropagation();
            setShowMenu(false);
            setShowPopover(!showPopover);
            setPopoverItems([
              {
                text: 'Switch Apps',
                url: process.env.AUTH_UI_AUTHORIZE_URL
              },
              {
                text: 'Change Password',
                url: `${process.env.AUTH_UI_AUTHORIZE_URL}/change-password`
              },
              {
                text: 'Edit User',
                url: `users/${token.sub}/edit`
              },
              {
                text: 'Logout',
                url: 'logout'
              }
            ]);
          }}
        >
          <Icon
            image={`https://www.gravatar.com/avatar/${crypto
              .createHash('md5')
              .update(email || '')
              .digest('hex')
              .toString()}`}
            size={32}
          />
        </button>
      </div>
    </header>
  );
};
