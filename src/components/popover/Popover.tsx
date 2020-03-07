import { Link } from '@reach/router';
import * as React from 'react';
import { useContext, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { PopoverContext } from '../../contexts';

import styles from './Popover.scss';

export const Popover: React.FC = () => {
  const { showPopover, setShowPopover, popoverItems } = useContext(
    PopoverContext
  );
  const wrapperRef = useRef(null);

  const handleClick = event => {
    if (
      wrapperRef &&
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target)
    ) {
      setShowPopover(false);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousedown', handleClick);
    };
  }, [showPopover]);

  if (!showPopover) {
    return null;
  }

  return createPortal(
    <ul className={styles.popover} ref={wrapperRef}>
      {popoverItems.map(item => (
        <li className={styles.popoverItem} key={item.url}>
          {item.url.match(/^http/i) ? (
            <a
              href={item.url}
              onClick={() => setShowPopover(false)}
            >
              {item.text}
            </a>
          ) : (
            <Link
              onClick={() => setShowPopover(false)}
              to={`${process.env.PUBLIC_URL}${item.url}`}
            >
              {item.text}
            </Link>
          )}
        </li>
      ))}
    </ul>,
    document.getElementById('popover')
  );
};
