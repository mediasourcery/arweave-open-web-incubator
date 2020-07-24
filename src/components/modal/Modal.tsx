import * as React from 'react';
import { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { ModalContext } from '../../contexts/modal';
import styles from './Modal.scss';

interface IProps {
  triggerText?: string;
  onClose?: Function;
  onOpen?: Function;
  onKeyDown?: Function;
  onClickAway?: Function;
}

const ModalContent = ({
  onClose,
  children,
  onKeyDown,
  modalRef,
  buttonRef,
  onClickAway
}) => {
  const { modalError } = useContext(ModalContext);

  return ReactDOM.createPortal(
    <aside
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      className={styles.cModalCover}
      onKeyDown={onKeyDown}
      onClick={onClickAway}
    >
      <div className={styles.cModal} ref={modalRef}>
        <div className={styles.cModalContent}>
          <button
            className={styles.cModalClose}
            ref={buttonRef}
            onClick={onClose}
          >
            <span className={styles.uHideVisually}>Close</span>
            <svg className={styles.cModalCloseIcon} viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
            </svg>
          </button>
          <div className={styles.cModalBody}>
            {children}
            {modalError && <p className={styles.modalError}>{modalError}</p>}
          </div>
        </div>
      </div>
    </aside>,
    document.body
  );
};

export const Modal: React.FC<IProps> = ({
  onClose,
  onOpen,
  onKeyDown,
  onClickAway
}) => {
  const { showModal, setShowModal, modalContent, setModalError } = useContext(
    ModalContext
  );

  onOpen = () => {
    if (this.closeButtonNode && this.closeButtonNode.focus()) return;
  };

  onClose = () => {
    setModalError('');
    setShowModal(false);
  };

  onClickAway = (e: Event) => {
    if (this.modalNode && this.modalNode.contains(e.target)) return;
    onClose();
  };

  onKeyDown = ({ keyCode }) => keyCode === 27 && onClose();

  useEffect(() => {
    showModal && onOpen();
  }, [showModal]);

  return (
    <>
      <CSSTransition
        classNames={{
          enter: styles.modalEnter,
          enterActive: styles.modalEnterActive,
          enterDone: styles.modalEnterDone,
          exit: styles.modalExit
        }}
        in={showModal}
        timeout={200}
        unmountOnExit
        onEnter={() => setShowModal(true)}
        onExited={() => setShowModal(false)}
      >
        <ModalContent
          modalRef={(n: HTMLElement) => (this.modalNode = n)}
          buttonRef={(n: HTMLElement) => (this.closeButtonNode = n)}
          onClose={onClose}
          onKeyDown={onKeyDown}
          onClickAway={onClickAway}
        >
          {modalContent}
        </ModalContent>
      </CSSTransition>
    </>
  );
};
