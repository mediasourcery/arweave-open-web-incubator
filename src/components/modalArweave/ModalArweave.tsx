import * as React from 'react';
import { useContext, useEffect } from 'react';
import { ArweaveContext, ModalContext } from '../../contexts';
import { Loader } from '../loader/Loader';
import styles from './ModalArweave.scss';

export const ArweaveModalContent: React.FunctionComponent = () => {
  return (
    <>
      <div>
        <ModalArweave></ModalArweave>
      </div>
    </>
  );
};

export const ModalArweave: React.FunctionComponent = () => {
  const [file, setFile] = React.useState(null);
  const [fileType, setFileType] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState('mmm');
  const {
    arweaveLogin,
    arweaveError,
    loginStatus,
    arweaveSuccess,
    resetArweave,
    getArweaveKey,
    arweaveIsLoading,
    setArweaveIsLoading,
    walletAddress,
    arweaveBalance,
    getArweaveBalance,
    initializeArweave,
    arweave
  } = useContext(ArweaveContext);
  const { setShowModal, setModalError } = useContext(ModalContext);

  const formRef = React.useRef<null | HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setArweaveIsLoading(true);
    resetArweave();
    const formData = new FormData();
    formData.append('uploadfile', file, file.name);
    const headers = new Headers();
    headers.delete('Content-Type');
    try {
      arweaveLogin(file);
    } catch (err) {
      console.log('the error');
      setResponse(err);
    }
  }

  const handleFile = e => {
    const file = e.target.files[0];
    setFile(file);
  };

  useEffect(() => {
    if (file) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }, [file]);

  useEffect(() => {
    getArweaveBalance();
    formRef.current.reset();
  }, [walletAddress]);

  useEffect(() => {
    initializeArweave();
  }, [arweave]);

  return (
    <form onSubmit={e => handleSubmit(e)} className={styles.form} ref={formRef}>
      <input
        type="file"
        name="uploadFile"
        id="upload-file"
        ref={ref => (this.fileUploader = ref)}
        className={styles.fileInput}
        style={{ display: 'none' }}
        onChange={e => handleFile(e)}
      />
      {arweaveIsLoading ? <Loader className={styles.filterGreen} /> :
        <div className={styles.modalMessage}>
          <p>{arweaveBalance !== 'NaN' &&
            walletAddress &&
            `Arweave balance: ${arweaveBalance} `}
            {walletAddress && (
              <a onClick={() => resetArweave()} href="#">
                Log out
              </a>
            )}</p>
          {!walletAddress &&
            <p>
              Store files on the permaweb. You must log in with your Arweave wallet.
            <a
                href="https://www.arweave.org/wallet"
                target="_blank"
                className={styles.documentLink}
              >
                Get yours here
              </a>
              <a href="#" onClick={e => this.fileUploader.click(e)}>
                Upload Wallet
              </a>
            </p>
          }
          {arweaveError && (
            <div className={styles.messageError}>{arweaveError}</div>
          )}
        </div>
      }
    </form>
  );
};
