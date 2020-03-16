import * as querystring from 'querystring';
import * as React from 'react';
import { render } from 'react-dom';
import { Router, RouteComponentProps } from '@reach/router';

import { Header, Menu, Popover, Breadcrumbs } from './components';
import {
  MenuContextProvider,
  PageContextProvider,
  PopoverContextProvider,
  BreadcrumbsContextProvider
} from './contexts';

import {
  DocumentsRoute,
	HomeRoute,
	UploadRoute
} from './routes';
import { decodeToken } from './utils';

import styles from './App.scss';

type Props = { component: React.ComponentType } & RouteComponentProps;
const Route: React.FunctionComponent<Props> = ({
  component: Component,
  ...rest
}) => <Component {...rest} />;

const App: React.FunctionComponent = () => {
  const query: {
    token?: string;
  } = querystring.parse(location.search.substr(1));

  if (query.token) {
    sessionStorage.setItem('token', query.token);
  } else if (!sessionStorage.getItem('token')) {
    window.location.href = `${process.env.AUTH_UI_AUTHORIZE_URL}?client_id=${process.env.AUTH_UI_CONSOLE_CLIENT_ID}`;
  }

  const decodedToken = decodeToken(sessionStorage.getItem('token'));
  if (!decodedToken.capabilities.find(c => c.name === 'admin')) {
    window.location.href = `${process.env.AUTH_UI_AUTHORIZE_URL}/unauthorized`;
    return;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Menu />
        <div className={styles.content}>
          <Breadcrumbs />
          <Router basepath={process.env.PUBLIC_URL}>
            <Route path="/" component={HomeRoute} />
            <Route path="/documents" component={DocumentsRoute} />
            <Route path="/upload" component={UploadRoute} />
          </Router>
        </div>
      </div>
      <Popover />
    </>
  );
};

export const AppProviders: React.SFC = ({ children }) => (
  <MenuContextProvider>
    <PageContextProvider>
      <BreadcrumbsContextProvider>
        <PopoverContextProvider>{children}</PopoverContextProvider>
      </BreadcrumbsContextProvider>
    </PageContextProvider>
  </MenuContextProvider>
);

render(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root')
);
