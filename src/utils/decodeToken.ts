import { decode } from 'jsonwebtoken';

interface IToken {
  attributes: {
    [key: string]: string;
  };
  authServiceUrl: string;
  capabilities: {
    name: string;
    target: string;
  }[];
  groups: string[];
  iat: number;
  identifiers: {
    type: string;
    value: string;
  }[];
  source: string;
  sub: string;
}

export const decodeToken = (token: string) => {
  const decodedToken = decode(token) as IToken;
  return decodedToken;
};
