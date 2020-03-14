import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  modalContent: React.ReactNode,
  setModalContent: Dispatch<SetStateAction<React.ReactNode>>;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export const ModalContext = createContext<IProps>({
  showModal: false,
  setShowModal: () => { },
  setModalContent: () => { },
  modalContent: {}
});

export const ModalContextProvider: React.SFC = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(<div />);

  const value = { showModal, setShowModal, modalContent, setModalContent };

  return (
    <ModalContext.Provider value={value}>
      {props.children}
    </ModalContext.Provider>
  );
};