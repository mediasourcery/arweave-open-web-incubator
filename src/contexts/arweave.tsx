import Arweave from 'arweave/web';
import { JWKInterface } from 'arweave/web/lib/wallet';
import * as React from 'react';
import {
  createContext, Dispatch,



  SetStateAction, useState
} from 'react';

interface IProps {
  arweave: any;
  arweaveInit: Dispatch<SetStateAction<any>>;
  wallet: JWKInterface;
  walletAddress: any;
  arweaveKey: JWKInterface;
  getWallet: Dispatch<SetStateAction<JWKInterface>>;
  getWalletAddress: Dispatch<SetStateAction<any>>;
  loginStatus: boolean;
  arweaveLogin: Dispatch<SetStateAction<any>>;
  setLoginStatus: Dispatch<SetStateAction<boolean>>;
  setArweaveKey: Dispatch<SetStateAction<JWKInterface>>;
  getArweaveKey: Dispatch<SetStateAction<any>>;
  walletUser: any;
  setWalletUser: Dispatch<SetStateAction<any>>;
  arweaveError: string;
  setArweaveError: Dispatch<SetStateAction<string>>;
  arweaveSuccess: string;
  setArweaveSuccess: Dispatch<SetStateAction<string>>;
  resetArweave: Dispatch<SetStateAction<void>>;
  arweaveBalance: string;
  setArweaveBalance: Dispatch<SetStateAction<void>>;
  getArweaveBalance: Dispatch<SetStateAction<void>>;
  initializeArweave: Dispatch<SetStateAction<void>>;
  lastTransaction: string;
  setLastTransaction: Dispatch<SetStateAction<string>>;
  allTransactions: [];
  setAllTransactions: Dispatch<SetStateAction<[]>>;
  arweaveIsLoading: boolean;
  setArweaveIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const ArweaveContext = createContext<IProps>({
  arweave: null,
  arweaveInit: () => { },
  wallet: null,
  walletAddress: null,
  arweaveKey: null,
  getWallet: () => { },
  getWalletAddress: () => { },
  loginStatus: null,
  arweaveLogin: () => { },
  setLoginStatus: () => { },
  setArweaveKey: () => { },
  getArweaveKey: () => { },
  walletUser: null,
  setWalletUser: () => { },
  arweaveError: '',
  setArweaveError: () => { },
  arweaveSuccess: '',
  setArweaveSuccess: () => { },
  resetArweave: () => { },
  arweaveBalance: '',
  setArweaveBalance: () => { },
  getArweaveBalance: () => { },
  initializeArweave: () => { },
  lastTransaction: '',
  setLastTransaction: () => { },
  allTransactions: [],
  setAllTransactions: () => { },
  arweaveIsLoading: false,
  setArweaveIsLoading: () => { }
});

export const ArweaveContextProvider: React.SFC = props => {
  // const [arweave, arweaveInit] = useState(Arweave.init({host: 'localhost', port: 8000, protocol: 'http'}));

  const [arweave, arweaveInit] = useState(Arweave.init({}));

  // const [arweave, arweaveInit] = useState(Arweave.init({host: 'arweave.net', port: 443, protocol: 'https'}));

  const [wallet, getWallet] = useState();
  const [arweaveKey, setArweaveKey] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [loginStatus, setLoginStatus] = useState(false);
  const [walletUser, setWalletUser] = useState(null);
  const [arweaveError, setArweaveError] = useState('');
  const [arweaveSuccess, setArweaveSuccess] = useState('');
  const [arweaveBalance, setArweaveBalance] = useState('');
  const [lastTransaction, setLastTransaction] = useState('');
  const [allTransactions, setAllTransactions] = useState('');
  const [arweaveIsLoading, setArweaveIsLoading] = useState(false);

  const getUser = async (address = walletAddress) => {
    setLoginStatus(false);
    if (walletAddress) {
      return walletAddress;
    }

    let txs;
    let tx;
    let username;

    let get_name_query = {
      op: 'and',
      expr1: {
        op: 'equals',
        expr1: 'App-Name',
        expr2: 'arweave-id'
      },
      expr2: {
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'equals',
          expr1: 'Type',
          expr2: 'name'
        }
      }
    };

    try {
      txs = await arweave.api.post(`arql`, get_name_query);
    } catch {
      setArweaveError('Failed to post name');
    }

    if (txs.data.length === 0) return address;

    try {
      tx = await arweave.transactions.get(txs.data[0]);
    } catch {
      setArweaveError('Failed to get transactions');
    }

    try {
      username = await tx.get('data', { decode: true, string: true });
    } catch {
      setArweaveError('Failed to get username');
    }

    setWalletAddress(address);
    setWalletUser(username);
    setLoginStatus(true);
    return username;
  };

  const getArweaveBalance = async () => {
    setArweaveIsLoading(true);
    arweave.wallets.getBalance(walletAddress).then(balance => {
      let winston = balance;
      let ar = arweave.ar.winstonToAr(balance);

      setArweaveBalance(ar);
      setArweaveIsLoading(false);
    });
  };

  const arweaveLogin = async ev => {
    const fileReader = new FileReader();

    fileReader.onload = async e => {
      // @ts-ignore
      const newWallet = JSON.parse(e.target.result);
      let user: string;
      let address: string;

      try {
        address = await arweave.wallets.jwkToAddress(newWallet);
      } catch {
        setArweaveError('Error setting wallet address');
      }

      try {
        user = await getUser(address);
        setArweaveSuccess(`Successfully logged into Arweave`);
        getWallet(newWallet);
        localStorage.setItem('wallet', JSON.stringify(newWallet));

        setWalletAddress(address);
        setWalletUser(user);
        setArweaveKey(newWallet);
        setLoginStatus(true);
        setArweaveIsLoading(false);
      } catch {
        setArweaveError('Error setting wallet user');
      }
    };
    fileReader.readAsText(ev);
  };

  const resetArweave = async () => {
    setWalletAddress('');
    setWalletUser('');
    setLoginStatus(false);
    setArweaveKey('');
    getWallet(null);
    setArweaveSuccess('');
    setArweaveError('');
    setArweaveBalance('');
    localStorage.removeItem('wallet');
  };

  const getArweaveKey = async key => {
    setArweaveIsLoading(true);
    if (!arweaveKey && !key) {
      let newKey: string;
      arweave.wallets.generate().then(key => {
        arweave.wallets.jwkToAddress(key).then(address => {
          setWalletAddress(address);
          setArweaveSuccess(`Successfully logged into Arweave`);
          setLoginStatus(true);
          setArweaveIsLoading(false);
        });
        setArweaveKey(key);

      });

      return newKey;
    }

    return key;
  };

  const isNull = value => typeof value === 'object' && !value;

  const initializeArweave = async ev => {
    const newest = JSON.parse(localStorage.getItem('wallet'));

    if (newest && !isNull(newest)) {
      // @ts-ignore
      const newWallet = newest;
      let user: string;
      let address: string;
      setArweaveIsLoading(true);
      try {
        address = await arweave.wallets.jwkToAddress(newWallet);
      } catch {
        setArweaveError('Error setting wallet address');
      }

      try {
        user = await getUser(address);
        setArweaveSuccess(`Successfully logged into Arweave`);
        getWallet(newWallet);
        setWalletAddress(address);
        setWalletUser(user);
        setArweaveKey(newWallet);
        setLoginStatus(true);
        setArweaveIsLoading(false);
      } catch {
        setArweaveError('Error setting wallet user');
      }
    }
  };

  const value = {
    arweave,
    arweaveInit,
    arweaveKey,
    wallet,
    getWallet,
    walletAddress,
    getWalletAddress: setWalletAddress,
    arweaveLogin,
    loginStatus,
    setLoginStatus,
    getArweaveKey,
    setArweaveKey,
    walletUser,
    setWalletUser,
    arweaveError,
    setArweaveError,
    arweaveSuccess,
    setArweaveSuccess,
    resetArweave,
    arweaveBalance,
    setArweaveBalance,
    getArweaveBalance,
    initializeArweave,
    lastTransaction,
    setLastTransaction,
    allTransactions,
    setAllTransactions,
    arweaveIsLoading,
    setArweaveIsLoading
  };

  return (
    <ArweaveContext.Provider value={value}>
      {props.children}
    </ArweaveContext.Provider>
  );
};
