import * as React from 'react';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface IProps {
  breadcrumbs: IBreadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<IBreadcrumb[]>>
}

interface IBreadcrumb {
  text: string;
  url: string;
}

export const BreadcrumbsContext = createContext<IProps>({
  breadcrumbs: [],
  setBreadcrumbs: () => { },
});

export const BreadcrumbsContextProvider: React.SFC = (props) => {

  const [breadcrumbs, setBreadcrumbs] = useState([{
    text: 'Home',
    url: ''
  }]);

  const value = { breadcrumbs, setBreadcrumbs };

  return (
    <BreadcrumbsContext.Provider value={value}>
      {props.children}
    </BreadcrumbsContext.Provider>
  );
};
