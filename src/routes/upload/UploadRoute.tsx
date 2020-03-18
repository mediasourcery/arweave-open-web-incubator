import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { Loader, Button, ContentBox, PageHeader } from '../../components';
import { PageContext } from '../../contexts';

import styles from './UploadRoute.scss';

export const UploadRoute: FC = () => {
  const { setPage } = useContext(PageContext);

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('uploadfile', file, file.name);

    const headers = new Headers();
    headers.delete('Content-Type');

    fetch('http://melapelan.in/upload.php', {
      method: 'post',
      headers,
      body: formData
    })
      .then(() => {
        setSuccessMessage('Document uploaded successfully!');
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        setErrorMessage(err);
        console.log(err);
      });
  }

  function handleFile(e): void {
    setFile(e.target.files[0]);
  }

  function handleSelect(e): void {
    console.log(e.target.value);
    setFileType(e.target.value);
  }

  useEffect(() => {
    setPage('upload');
  }, []);

  useEffect(() => {
    async function fetchFilesList() {
      const response = await fetch('https://melapelan.in/upload.php');
      const data = await response.json();
      setFilesArray(Object.values(data.files));
    }

    fetchFilesList();
  }, []);

  function renderFilesList() {
    if (filesArray) {
      return filesArray.map(f => (
        <li key={f}>
          <a href="http://melapelan.in/uploads/">{f}</a>
        </li>
      ));
    }
  }

  return (
    <ContentBox>
      <PageHeader header="Document Uploader"></PageHeader>

      <div className="files-list-conta">
        <ol className="files-list">{renderFilesList()}</ol>
      </div>

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
