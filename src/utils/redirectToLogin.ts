export const redirectToLogin = () => {
  const url = process.env.AUTH_UI_GATEWAY_URL;
  const clientId = process.env.CLIENT_ID;

  const redirectUri =
    location.pathname === process.env.PUBLIC_URL ||
    location.pathname === process.env.PUBLIC_URL.replace(/\/$/, '')
      ? process.env.PUBLIC_URL
      : location.pathname.replace(
          new RegExp(`^${process.env.PUBLIC_URL}`, 'i'),
          '/'
        );

  const params = [`client_id=${clientId}`];
  if (redirectUri) {
    params.push(`redirect_uri=${redirectUri}`);
  }

  window.location.href = `${url}?${params.join('&')}`;
};
