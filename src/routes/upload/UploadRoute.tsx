import * as React from 'react';
import * as blockstack from 'blockstack';
import { putFile } from 'blockstack';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { Loader, Button, ContentBox, PageHeader } from '../../components';
import { BreadcrumbsContext, PageContext } from '../../contexts';
import { redirectToLogin } from '../../utils';
import { decodeToken } from '../../utils';

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

  function handleSubmit(e: FormEvent): void {
    let options = {
      encrypt: false
    }

    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('uploadfile', file, file.name);

    const headers = new Headers();
    headers.delete('Content-Type');



    if (serverType === 'gaia') {
      try {
        putFile(file.name, file, options).then(() => {
          setSuccessMessage('Document uploaded successfully!');
          setIsLoading(false);
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      fetch(`${process.env.DOC_API_URL}/upload.php`, {
        method: 'post',
        headers,
        body: formData
      })
        .then(() => {
          setSuccessMessage('Document uploaded successfully!');
          setIsLoading(false);
        })
        .catch(err => {
          if (err.response?.status === 401) {
            redirectToLogin();
          }
          setIsLoading(false);
          setErrorMessage(err);
        });
    }
  }

  function handleFile(e): void {
    setFile(e.target.files[0]);
  }

  function handleSelect(e): void {
    setFileType(e.target.value);
  }

  useEffect(() => {
    setPage('upload');
    setBreadcrumbs([{
      text: 'File Upload',
      url: 'upload'
    }])
  }, []);

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
        {token.sub.includes('blockstack') &&
          <select
            name="serverType"
            id="serverType"
            className={styles.select}
            onChange={e => setServerType(e.target.value)}
          >
            <option value="">- Choose upload location -</option>
            <option value="internal">Internal Server (default)</option>
            <option value="gaia">GAIA Server</option>
          </select>
        }
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

      {isLoading ? <Loader className={styles.loader} /> : null}

      {successMessage ? (
        <div className={styles.messageSuccess}>{successMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className={styles.messageError}>{errorMessage}</div>
      ) : null}
    </ContentBox>
  );
};
