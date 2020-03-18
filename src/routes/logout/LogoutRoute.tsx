import * as React from 'react';

export const LogoutRoute: React.FC = () => {
  sessionStorage.clear();
  window.location.href = `${process.env.AUTH_UI_GATEWAY_URL}/logout`;
  return null;
};
