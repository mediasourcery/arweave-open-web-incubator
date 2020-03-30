import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import {
  ModalLink,
  IconButton,
  Loader,
  Button,
  ContentBox,
  PageHeader
} from '../../components';
import { BreadcrumbsContext, ModalContext, PageContext } from '../../contexts';

import { redirectToLogin } from '../../utils';

import styles from './DocumentsRoute.scss';

export const DocumentsRoute: FC = () => {
  const { setPage } = useContext(PageContext);
  const { setShowModal, setModalError } = useContext(ModalContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [filesArray, setFilesArray] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  function getDocuments(): void {
    setIsLoading(true);
    setFilesArray([]);

    const headers = new Headers();
    headers.delete('Content-Type');

    fetch(`${process.env.DOC_API_URL}/upload.php`, {
      method: 'get',
      headers
    })
      .then(res => res.json())
      .then(json => {
        if (json) {
          typeof json.moved === 'string' && setResponse(json.moved);
          setFilesArray(Object.values(json.files));
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (err.response?.status === 401) {
          redirectToLogin();
        }
        setIsLoading(false);
        setResponse(err);
      });
  }

  function handleDelete(fileName) {
    setModalError('');
    const headers = new Headers();

    fetch(`${process.env.DOC_API_URL}/upload.php`, {
      method: 'POST',
      headers,
      body: JSON.stringify(fileName)
    })
      .then(res => res.json())
      .then(json => {
        if (json) {
          setFilesArray(Object.values(json.files));
        }
      })
      .catch(() => {
        setModalError('Failed to delete document.');
      });
  }

  const getModalContent = name => {
    return (
      <>
        <div className={styles.modalMessage}>
          Are you sure you want to delete this document?{' '}
          <div>
            Name: <span>{name}</span>
          </div>
        </div>
        <div className={styles.modalButtonContainer}>
          <Button
            className={styles.modalButtonBlue}
            onClick={() => {
              handleDelete(name);
              setShowModal(false);
            }}
          >
            Delete
          </Button>
          <Button
            className={styles.modalButtonRed}
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
        </div>
      </>
    );
  };

  useEffect(() => {
    setPage('documents');
    getDocuments();
    setBreadcrumbs([{
      text: 'Documents',
      url: 'documents'
    }])
  }, []);

  return (
    <ContentBox>
      <PageHeader header="Documents"></PageHeader>

      {isLoading ? (
        <Loader className={styles.loader} />
      ) : (
        filesArray && (
          <div className={styles.response}>
            {response}
            <div>
              <h3>Files on server:</h3>
              {filesArray.length < 1 ? (
                <p>No files located on server.</p>
              ) : (
                filesArray.map((file, index) => (
                  <div className={styles.document} key={file}>
                    <p>{file}</p>
                    <ModalLink content={getModalContent(file)}>
                      <IconButton
                        className={styles.actionBtn}
                        disabled={isDeleting}
                        image="icons/delete-primary.svg"
                        title="Delete Service"
                      />
                    </ModalLink>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      )}
    </ContentBox>
  );
};
