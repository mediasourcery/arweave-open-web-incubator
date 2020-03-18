export const redirectToLogin = () => {
  const gatewayUrl = process.env.AUTH_UI_GATEWAY_URL;
  const clientId = process.env.CLIENT_ID;
  const redirectUri = location.pathname.replace(new RegExp(`^${process.env.PUBLIC_URL}`, 'i'), '/');
  window.location.href = `${gatewayUrl}?client_id=${clientId}&redirect_uri=${redirectUri}`;
};
