export const redirectToLogin = () => {
  const authorizeUrl = process.env.AUTH_UI_AUTHORIZE_URL;
  const clientId = process.env.CLIENT_ID;
  const redirectUri = location.pathname.replace(new RegExp(`^${process.env.PUBLIC_URL}`, 'i'), '/');
  window.location.href = `${authorizeUrl}?client_id=${clientId}&redirect_uri=${redirectUri}`;
};
