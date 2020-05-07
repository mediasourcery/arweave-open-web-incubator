import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../../utils';
import { deleteFile, getFile, listFiles } from 'blockstack';
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
  const token = decodeToken(sessionStorage.getItem('token'));
  const { setPage } = useContext(PageContext);
  const { setShowModal, setModalError } = useContext(ModalContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [filesArray, setFilesArray] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const getDocuments = async () => {
    setFilesArray([]);
    setIsLoading(true);

    const headers = new Headers();
    headers.delete('Content-Type');

    const files = [];

    try {
      const response = await fetch(`${process.env.DOC_API_URL}/upload.php`, {
        method: 'get',
        headers
      })
      const json = await response.json();
      if (json) {
        typeof json.moved === 'string' && setResponse(json.moved);
        Object.values(json.files).map(file => {
          files.push({ fileName: file, server: 'Internal Server' });
        })
      }

      if (token.sub.includes('blockstack')) {
        await getGaiaServerDocuments(files);
      }

      setFilesArray(files);
      setIsLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
      }
      setIsLoading(false);
      setResponse(err);
    }
  }

  const getGaiaServerDocuments = async (files) => {
    try {
      await listFiles(file => {
        files.push({ fileName: file, server: 'GAIA Server' });
        return true;
      });
    } catch (err) {
      console.log(err);
    }
  }

  const deleteGaiaServerDocument = async (name: string) => {
    console.log(name);
    setModalError('');
    try {
      const response = await deleteFile(name);
      console.log(response);
      setIsLoading(false);
      setFilesArray([]);
      await getDocuments();
    } catch (err) {
      setModalError('Failed to delete document.');
    }
  }

  const handleDelete = async (fileName) => {
    setModalError('');
    const headers = new Headers();

    const files = [];

    try {
      const response = await fetch(`${process.env.DOC_API_URL}/upload.php`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(fileName)
      })
      const json = await response.json();
      console.log(json)
      if (json) {
        Object.values(json.files).map(file => {
          files.push({ fileName: file, server: 'Internal Server' });
        })
      }
      if (token.sub.includes('blockstack')) {
        await getGaiaServerDocuments(files);
      }
      setFilesArray(files);
    } catch {
      setModalError('Failed to delete document.');
    }
  }

  const getModalContent = (name, server) => {
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
              server === 'GAIA server' ? deleteGaiaServerDocument(name) : handleDelete(name);
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
              <table>
                <tbody>
                  <tr>
                    <th>File name:</th>
                    <th>Server:</th>
                  </tr>
                  {filesArray.length < 1 ? (
                    <tr>
                      <td colSpan={2}>No files located on server.</td>
                    </tr>
                  ) : (
                      filesArray.map((file, index) => (
                        <tr className={styles.document} key={file.fileName}>
                          <td>{file.fileName}</td>
                          <td>
                            <div className={styles.flexContainer}>
                              {file.server}
                              <ModalLink content={getModalContent(file.fileName, file.server)}>
                                <IconButton
                                  className={styles.actionBtn}
                                  disabled={isDeleting}
                                  image="icons/delete-primary.svg"
                                  title="Delete Service"
                                />
                              </ModalLink>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>
          )
        )}
    </ContentBox>
  );
};
