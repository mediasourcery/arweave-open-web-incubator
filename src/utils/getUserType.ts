import { decodeToken } from './decodeToken';

export const getUserType = (): 'internal' | 'blockstack' | 'uport' | 'unknown' => {
  const token = decodeToken(sessionStorage.getItem('token'));

  if (token?.sub?.includes('blockstack')) {
    return 'blockstack';
  }

  if (
    localStorage.getItem('connectState') &&
    JSON.parse(JSON.parse(localStorage.getItem('connectState'))).name
  ) {
    return 'uport';
  }

  if (token) {
    return 'internal';
  }

  return 'unknown';
};
