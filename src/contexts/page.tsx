import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  page: '' | 'upload' | '404';
  setPage: Dispatch<SetStateAction<string>>;
}

export const PageContext = createContext<IProps>({
  page: '',
  setPage: () => {}
});

export const PageContextProvider: React.SFC = props => {
  const [page, setPage] = useState<'' | 'upload'>('');

  const value = { page, setPage };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
