import * as querystring from 'querystring';
import * as React from 'react';
import { FC } from 'react';
import { render } from 'react-dom';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './App.scss';

import { Modal, Popover } from './components';
import { MainLayout } from './layouts/main/MainLayout';
import {
  MenuContextProvider,
  ModalContextProvider,
  PageContextProvider,
  PopoverContextProvider,
  BreadcrumbsContextProvider
} from './contexts';

import { decodeToken, getUserType } from './utils';
import { DocumentsRoute, Error404Route, HomeRoute, LogoutRoute, UploadRoute } from './routes';
import { redirectToLogin } from './utils';

import styles from './App.scss';
import { ArweaveContextProvider } from './contexts/arweave';

const App: React.FunctionComponent = () => {
  const query: {
    token?: string;
    blockstackSession?: string;
    uPortSession?: string;
  } = querystring.parse(location.search.substr(1));

  if (query.blockstackSession) {
    localStorage.setItem('blockstack-session', atob(query.blockstackSession));
  }
  if (query.uPortSession) {
    localStorage.setItem('connectState', atob(query.uPortSession));
  }
  if (query.token) {
    sessionStorage.setItem('token', query.token);
  }
  
  const userType = getUserType();
  if (userType === 'unknown') {
    redirectToLogin();
    return;
  }

  const routes: {
    [path: string]: {
      component: FC;
      layout?: FC;
      isPublic?: boolean;
    };
  } = {
    '/': {
      component: HomeRoute,
      layout: MainLayout
    },
    '/documents': {
      component: DocumentsRoute,
      layout: MainLayout
    },
    '/logout': {
      component: LogoutRoute,
      layout: MainLayout
    },
    '/upload': {
      component: UploadRoute,
      layout: MainLayout
    },
    '*': {
      component: Error404Route
    }
  };
  if (userType === 'internal') {
    const decodedToken = decodeToken(sessionStorage.getItem('token'));

    if (
      !decodedToken.capabilities.find(
        c =>
          (c.name === 'admin' && c.target === null) ||
          (c.name === 'use' && c.target === process.env.CLIENT_ID)
      )
        && !localStorage.getItem('uport-session')
    ) {
      window.location.href = `${process.env.AUTH_UI_GATEWAY_URL}/unauthorized`;
      return;
    }
  }

  return (
    <>
      <Helmet
        title="Home"
        titleTemplate={`%s | ${process.env.DOC_UI_UPLOADER_TITLE}`}
      />
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          {Object.entries(routes).map(([path, route]) => (
            <Route exact path={path} key={path}>
              {route.layout ? (
                <route.layout>
                  <route.component />
                </route.layout>
              ) : (
                  <route.component />
                )}
            </Route>
          ))}
        </Switch>
        <Popover />
      </Router>
      <Modal />
    </>
  );
};

export const AppProviders: React.SFC = ({ children }) => (
  <ArweaveContextProvider>
    <MenuContextProvider>
      <ModalContextProvider>
        <PageContextProvider>
          <BreadcrumbsContextProvider>
            <PopoverContextProvider>{children}</PopoverContextProvider>
          </BreadcrumbsContextProvider>
        </PageContextProvider>
      </ModalContextProvider>
    </MenuContextProvider>
  </ArweaveContextProvider>
);

render(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root')
);
