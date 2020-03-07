import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  showMenu: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
}

export const MenuContext = createContext<IProps>({
  showMenu: false,
  setShowMenu: () => {}
});

export const MenuContextProvider: React.SFC = props => {
  const [showMenu, setShowMenu] = useState(false);

  const value = { showMenu, setShowMenu };

  return (
    <MenuContext.Provider value={value}>{props.children}</MenuContext.Provider>
  );
};
