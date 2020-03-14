import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { ModalLink, IconButton, Loader, Button, ContentBox, PageHeader } from '../../components';
import { ModalContext, PageContext } from '../../contexts';

import styles from './DocumentsRoute.scss';

export const DocumentsRoute: FC = () => {
  const { setPage } = useContext(PageContext);
  const { setShowModal } = useContext(ModalContext);

  const [filesArray, setFilesArray] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
          typeof (json.moved) === 'string' && setResponse(json.moved);
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

  function deleteDocument(name): void {
    setIsLoading(true);
    setFilesArray([]);

    const headers = new Headers();
    headers.delete('Content-Type');

    fetch(`http://melapelan.in/upload.php/api/documents/${name}`, {
      method: 'delete'
    })
      .then(res => res.json())
      .then(json => {
        if (json) {
          typeof (json.moved) === 'string' && setResponse(json.moved);
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

  const getModalContent = (name, index) => {
    console.log(name);
    return (
      <>
        <div className={styles.modalMessage}>Are you sure you want to delete this document? <div>Name: <span>{name}</span></div></div>
        <div className={styles.modalButtonContainer}>
          <Button className={styles.modalButtonBlue} onClick={() => { deleteDocument(name); setShowModal(false); }}>Delete</Button>
          <Button className={styles.modalButtonRed} onClick={() => setShowModal(false)}>Cancel</Button>
        </div>
      </>
    )
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
                {filesArray.length < 1 ? <p>No files located on server.</p> : filesArray.map((file, index) => (
                  <div className={styles.document} key={file}>
                    <p>{file}</p>
                    <ModalLink content={getModalContent(file, index)}>
                      <IconButton
                        className={styles.actionBtn}
                        disabled={isDeleting}
                        image="icons/delete-primary.svg"
                        title="Delete Service"
                      />
                    </ModalLink>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
    </ContentBox>
  );
};
