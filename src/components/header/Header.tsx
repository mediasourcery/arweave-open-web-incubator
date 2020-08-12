import * as crypto from 'crypto';
import * as React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconButton } from '..';
import { MenuContext, PopoverContext } from '../../contexts';
import { decodeToken, getUserType } from '../../utils';
import { ArweaveModalContent } from '../modalArweave/ModalArweave';
import styles from './Header.scss';

export const Header: React.FunctionComponent = () => {
  const { showMenu, setShowMenu } = useContext(MenuContext);
  const { setPopoverItems, showPopover, setShowPopover } = useContext(
    PopoverContext
  );

  const token = sessionStorage.getItem('token')
    ? decodeToken(sessionStorage.getItem('token'))
    : undefined;
  const emailIdentifier = token
    ? token.identifiers.find(identifier => identifier.type === 'email')
    : undefined;
  const email = emailIdentifier ? emailIdentifier.value : '';

  const userType = getUserType();
  const uPortUser = userType === 'uport'
    ? JSON.parse(JSON.parse(localStorage.getItem('connectState')))
    : undefined;

  const username = token
    ? token.sub
    : uPortUser
      ? uPortUser.name
      : 'Unknown';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Link
          className={styles.titleLink}
          onClick={() => setShowMenu(false)}
          to="/"
        >
          <Icon image="icons/auth-icon.svg" size={32} />
          <span className={styles.text}>Doc Uploader v1.1</span>
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
      <div>
        <ArweaveModalContent></ArweaveModalContent>
      </div>
      <div className={styles.spacer} />
      <div className={styles.userName}>{username}</div>
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
                url: process.env.AUTH_UI_GATEWAY_URL
              },
              {
                text: 'Change Password',
                url: `${process.env.AUTH_UI_GATEWAY_URL}/change-password`
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
