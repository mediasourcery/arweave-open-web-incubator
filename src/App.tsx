import * as querystring from 'querystring';
import * as React from 'react';
import { render } from 'react-dom';
import { Router, RouteComponentProps } from '@reach/router';
import { Helmet } from 'react-helmet';

import { Header, Menu, Modal, Popover, Breadcrumbs } from './components';
import {
  MenuContextProvider,
  ModalContextProvider,
  PageContextProvider,
  PopoverContextProvider,
  BreadcrumbsContextProvider
} from './contexts';

import { DocumentsRoute, HomeRoute, LogoutRoute, UploadRoute } from './routes';
import { redirectToLogin } from './utils';

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
    redirectToLogin();
  }

  return (
    <>
      <Helmet
        title="Home"
        titleTemplate={`%s | ${process.env.DOC_UI_UPLOADER_TITLE}`}
      />
      <Header />
      <div className={styles.container}>
        <Menu />
        <div className={styles.content}>
          <Breadcrumbs />
          <Router basepath={process.env.PUBLIC_URL}>
            <Route path="/" component={HomeRoute} />
            <Route path="/documents" component={DocumentsRoute} />
            <Route path="/logout" component={LogoutRoute} />
            <Route path="/upload" component={UploadRoute} />
          </Router>
        </div>
      </div>
      <Popover />
      <Modal />
    </>
  );
};

export const AppProviders: React.SFC = ({ children }) => (
  <MenuContextProvider>
    <ModalContextProvider>
      <PageContextProvider>
        <BreadcrumbsContextProvider>
          <PopoverContextProvider>{children}</PopoverContextProvider>
        </BreadcrumbsContextProvider>
      </PageContextProvider>
    </ModalContextProvider>
  </MenuContextProvider>
);

render(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root')
);
