import * as React from 'react';

export const LogoutRoute: React.FC = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = `${process.env.AUTH_UI_GATEWAY_URL}/logout`;
  return null;
};
