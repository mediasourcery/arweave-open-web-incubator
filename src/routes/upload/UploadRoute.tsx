import { putFile } from 'blockstack';
import * as IPFS from 'ipfs';
import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';
import { Button, ContentBox, Loader, PageHeader } from '../../components';
import {
  ArweaveContext,
  BreadcrumbsContext,
  PageContext
} from '../../contexts';
import { decodeToken, redirectToLogin } from '../../utils';
import styles from './UploadRoute.scss';


export const UploadRoute: FC = () => {
  const token = decodeToken(sessionStorage.getItem('token'));
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [serverType, setServerType] = useState('internal');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {
    arweave,
    arweaveKey,
    walletAddress,
    setLastTransaction
  } = useContext(ArweaveContext);
  const [arweaveLink, setArweaveLink] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [ipfsNode, setIpfsNode] = useState<any>();


  const handleGaiaUpload = async (fileName, file) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await putFile(fileName, file, {
        encrypt: false
      });
      setSuccessMessage('Document uploaded successfully!');
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleArweaveUpload = async file => {
    let transaction;
    let response;

    if (!arweaveKey) {
      setErrorMessage('No arweave key found. Please log in and try again.');
      setIsLoading(false);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async ev => {
      // @ts-ignore
      const filetoRead = new Uint8Array(ev.target.result);

      try {
        transaction = await arweave.createTransaction(
          {
            data: filetoRead
          },
          arweaveKey
        );

        transaction.addTag('Content-Type', file.type);
        transaction.addTag('File-Name', file.name);
        transaction.addTag('Upload-Date', Date.now());
      } catch {
        setErrorMessage('Failed to create transaction. Please try again.');
        setIsLoading(false);
      }

      try {
        await arweave.transactions.sign(transaction, arweaveKey);
      } catch (err) {
        setErrorMessage('Failed to sign transaction. Please try again.');
        setIsLoading(false);
      }

      try {
        response = await arweave.transactions.post(transaction);
      } catch (err) {
        setErrorMessage('Failed to post transaction. Please try again.');
        setIsLoading(false);
      }

      if (response.status === 200 || response.status === 202) {
        setSuccessMessage(
          `Document uploaded successfully! Here's your transaction id: ${transaction.id}`
        );

        setLastTransaction(transaction.id);

        setArweaveLink(
          `${arweave.api.config.protocol}://${arweave.api.config.host}:${arweave.api.config.port}/${transaction.id}`
        );

        setIsLoading(false);
      }

      return response;
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleIpfsUpload = async (fileName, file: File) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const uport = new uportconnect('TestApp', {
        network: 'mainnet',
        bannerImage: {
          '/': '/ipfs/QmQf1uGU7M9vSv3gFEmU36g1idim7hhtbog8yBnYCy7Psz'
        }
      });
      const results = await ipfsNode.add(file);
      for await (const { cid } of results) {
        uport.sendVerification({
          claim: { Document: { Name: fileName, Type: file.type, Hash: cid.toString() } }
        });
      }
      setSuccessMessage('Document uploaded successfully!');
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleServerUpload = async (method, headers, body) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await fetch(`${process.env.DOC_API_URL}/uploads`, {
        method,
        headers,
        body
      });
      setSuccessMessage('Document uploaded successfully!');
      setIsLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
      }
      setIsLoading(false);
      console.log(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();

    formData.append('uploadfile', file, file.name);

    const headers = new Headers();
    headers.delete('Content-Type');

    if (serverType === 'gaia') {
      await handleGaiaUpload(file.name, file);
    } else if (serverType === 'ipfs') {
      await handleIpfsUpload(file.name, file);
    } else if (serverType === 'arweave') {
      await handleArweaveUpload(file);
    } else {
      await handleServerUpload('post', headers, formData);
    }
  };

  const handleFile = e => {
    setFile(e.target.files[0]);
  };

  const handleInput = e => {
    setInputUrl(e.target.value);
    setFile(e.target.value);
  };

  const handleSelect = e => {
    setFileType(e.target.value);
  };

  const load = async () => {
    if (localStorage.getItem('connectState')) {
      setIpfsNode(await IPFS.create());
    }
  };

  useEffect(() => {
    setPage('upload');
    setBreadcrumbs([
      {
        text: 'File Upload',
        url: 'upload'
      }
    ]);
    load();
  }, []);

  const uPortUser = localStorage.getItem('connectState')
    ? JSON.parse(JSON.parse(localStorage.getItem('connectState')))
    : undefined;

  return (
    <ContentBox>
      <PageHeader header="Document Uploader"></PageHeader>
      <form onSubmit={e => handleSubmit(e)} className={styles.form}>
        <select
          name="fileType"
          id="fileType"
          className={styles.select}
          onChange={e => handleSelect(e)}
        >
          <option value="">- Choose file type -</option>
          <option value="image">image</option>
          <option value="document">document</option>
          <option value="pdf">pdf</option>
        </select>
        {token?.sub?.includes('blockstack') && (
          <select
            name="serverType"
            id="serverType"
            className={styles.select}
            onChange={e => setServerType(e.target.value)}
          >
            <option value="">- Choose upload location -</option>
            <option value="internal">Internal Server (default)</option>
            {walletAddress && <option value="arweave">Arweave Server</option>}
            <option value="gaia">GAIA Server</option>
          </select>
        )}
        {uPortUser && (
          <select
            name="serverType"
            id="serverType"
            className={styles.select}
            onChange={e => setServerType(e.target.value)}
          >
            <option value="">- Choose upload location -</option>
            {walletAddress && <option value="arweave">Arweave Server</option>}
            <option value="internal">Internal Server (default)</option>
            <option value="ipfs">IPFS</option>
          </select>
        )}
        {!token?.sub?.includes('blockstack') && !uPortUser && (
          <select
            name="serverType"
            id="serverType"
            className={styles.select}
            onChange={e => setServerType(e.target.value)}
          >
            <option value="">- Choose upload location -</option>
            {walletAddress && <option value="arweave">Arweave Server</option>}
            <option value="internal">Internal Server (default)</option>
          </select>
        )}
        <input
          type="file"
          name="upload-file"
          id="upload-file"
          className={styles.fileInput}
          onChange={e => handleFile(e)}
        />
        <Button
          type="submit"
          disabled={!file || !fileType}
          styleOverride={styles.button}
        >
          Upload File
        </Button>
      </form>

      {successMessage ? (
        <div className={styles.messageSuccess}>{successMessage}</div>
      ) : null}

      {arweaveLink && successMessage ? (
        <div className={styles.messageSuccess}>
          <a className={styles.link} href={arweaveLink} target="_blank">
            <Button styleOverride={styles.button}>View File</Button>
          </a>
        </div>
      ) : null}

      {errorMessage ? (
        <div className={styles.messageError}>{errorMessage}</div>
      ) : null}

      {isLoading ? <Loader className={styles.loader} /> : null}
    </ContentBox>
  );
};
