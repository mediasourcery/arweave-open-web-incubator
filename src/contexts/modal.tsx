import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  modalContent: React.ReactNode;
  setModalContent: Dispatch<SetStateAction<React.ReactNode>>;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  modalError: string;
  setModalError: Dispatch<SetStateAction<string>>;
}

export const ModalContext = createContext<IProps>({
  showModal: false,
  setShowModal: () => {},
  setModalContent: () => {},
  modalContent: {},
  modalError: '',
  setModalError: () => {}
});

export const ModalContextProvider: React.SFC = props => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(<div />);
  const [modalError, setModalError] = useState('');

  const value = {
    showModal,
    setShowModal,
    modalContent,
    setModalContent,
    modalError,
    setModalError
  };

  return (
    <ModalContext.Provider value={value}>
      {props.children}
    </ModalContext.Provider>
  );
};
