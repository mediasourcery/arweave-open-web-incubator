import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { Loader, Button, ContentBox, PageHeader } from '../../components';
import { PageContext } from '../../contexts';

import styles from './DocumentsRoute.scss';

export const DocumentsRoute: FC = () => {
  const { setPage } = useContext(PageContext);

  const [filesArray, setFilesArray] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  function getDocuments(): void {
    setIsLoading(true);
    setFilesArray([]);

    const headers = new Headers();
    headers.delete('Content-Type');

    fetch('http://melapelan.in/upload.php', {
      method: 'get',
      headers
    })
      .then(res => res.json())
      .then(json => {
        if (json) {
          typeof(json.moved) === 'string' && setResponse(json.moved);
          setFilesArray(Object.values(json.files));
          setIsLoading(false);
        }
      })
      .catch(err => {
        setIsLoading(false);
        setResponse(err);
        console.log(err);
      });
  }

  useEffect(() => {
    setPage('documents');
    getDocuments();
  }, []);

  return (
    <ContentBox>
      <PageHeader header="Documents"></PageHeader>

      {isLoading ? (
        <Loader />
      ) : (
        filesArray && (
          <div className={styles.response}>
            {response}
            <div>
              <h3>Files on server:</h3>
              {filesArray.length < 1 ? <p>No files located on server.</p> : filesArray.map(file => (
                <p key={file}>{file}</p>
              ))}
            </div>
          </div>
        )
      )}
    </ContentBox>
  );
};
