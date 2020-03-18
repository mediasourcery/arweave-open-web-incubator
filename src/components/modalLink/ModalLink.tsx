import * as React from 'react';
import { useContext } from 'react';
import { ModalContext } from '../../contexts/modal';
import styles from './ModalLink.scss';

interface IProps {
  image?: string;
  size?: number;
  to?: string;
  type?: 'button' | 'submit';
  content: React.ReactNode;
}

export const ModalLink: React.FC<IProps> = ({
  children,
  content,
  image,
  size = 24,
  type = 'button'
}) => {
  const { setShowModal, setModalContent } = useContext(ModalContext);

  return (
    <>
      <div
        className={styles.button}
        style={
          image
            ? {
                backgroundImage: `url(/${image})`,
                height: `${size}px`,
                width: `${size}px`
              }
            : null
        }
        // type={type}
        onClick={() => {
          setShowModal(true);
          setModalContent(content);
        }}
      >
        {children}
      </div>
    </>
  );
};
