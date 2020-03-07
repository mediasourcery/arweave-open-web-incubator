import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  popoverElement: HTMLElement;
  setPopoverElement: Dispatch<SetStateAction<HTMLElement>>;
  popoverItems: {
    text?: string;
    url?: string;
  }[];
  setPopoverItems: Dispatch<SetStateAction<{
    text?: string;
    url?: string;
  }[]>>;
  showPopover: boolean;
  setShowPopover: Dispatch<SetStateAction<boolean>>;
}

export const PopoverContext = createContext<IProps>({
  popoverElement: null,
  setPopoverElement: () => {},
  popoverItems: [],
  setPopoverItems: () => {},
  showPopover: false,
  setShowPopover: () => {}
});

export const PopoverContextProvider: React.SFC = props => {
  const [popoverElement, setPopoverElement] = useState<HTMLElement>(null);
  const [popoverItems, setPopoverItems] = useState<{
    text?: string;
    url?: string;
  }[]>([]);
  const [showPopover, setShowPopover] = useState(false);

  const value = { popoverElement, setPopoverElement, popoverItems, setPopoverItems, showPopover, setShowPopover };

  return (
    <PopoverContext.Provider value={value}>{props.children}</PopoverContext.Provider>
  );
};
