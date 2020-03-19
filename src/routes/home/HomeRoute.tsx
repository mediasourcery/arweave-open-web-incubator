import * as React from 'react';
import { Redirect } from '@reach/router';

export const HomeRoute: React.FC = () => (
  <Redirect to={`${process.env.PUBLIC_URL}documents`} />
);
