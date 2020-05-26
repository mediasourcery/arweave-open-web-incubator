import * as React from 'react';
import * as path from 'path';
import { FC, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../../utils';
import { deleteFile, getFileUrl, listFiles } from 'blockstack';
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

    try {
      const files = [];
      const response = await fetch(`${process.env.DOC_API_URL}/upload.php`, {
        method: 'get',
        headers
      });
      const json = await response.json();
      if (json) {
        typeof json.moved === 'string' && setResponse(json.moved);
        Object.values(json.files).map(file => {
          files.push({
            fileName: file,
            server: 'Internal Server',
            hasThumbnail: determineIfThumbnail(file)
          });
        });
      }

      if (token.sub.includes('blockstack')) {
        const gaiaFiles = await getGaiaServerDocuments();
        gaiaFiles.map(gaiaFile => {
          files.push(gaiaFile);
        });
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
  };

  const getGaiaServerDocuments = async () => {
    try {
      const files = [];
      await listFiles(file => {
        files.push(file);
        return true;
      });
      return await Promise.all(
        files.map(async file => {
          return {
            fileName: file,
            fileUrl: await getFileUrl(file),
            server: 'GAIA Server',
            hasThumbnail: determineIfThumbnail(file)
          };
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deleteGaiaServerDocument = async (name: string) => {
    setModalError('');
    try {
      await deleteFile(name);
      setIsLoading(false);
      setFilesArray([]);
      await getDocuments();
    } catch (err) {
      setModalError('Failed to delete document.');
    }
  };

  const handleDelete = async fileName => {
    setFilesArray([]);
    setModalError('');
    const headers = new Headers();

    try {
      const response = await fetch(`${process.env.DOC_API_URL}/upload.php`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(fileName)
      });
      const json = await response.json();
      if (json) {
        await getDocuments();
      }
    } catch {
      setModalError('Failed to delete document.');
    }
  };

  const determineIfThumbnail = fileName => {
    const imageFileTypes = ['.jpg', '.jpeg', '.png', '.svg', '.bmp'];
    return imageFileTypes.includes(path.extname(fileName));
  };

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
              server === 'GAIA Server'
                ? deleteGaiaServerDocument(name)
                : handleDelete(name);
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
    setBreadcrumbs([
      {
        text: 'Documents',
        url: 'documents'
      }
    ]);
  }, []);

  useEffect(() => {
    if (filesArray) {
      return;
    }
  }, [filesArray]);

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
                  filesArray
                    .sort(function(a, b) {
                      if (a.fileName.toLowerCase() < b.fileName.toLowerCase()) {
                        return -1;
                      }
                      if (a.fileName.toLowerCase() > b.fileName.toLowerCase()) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((file, index) => (
                      <tr
                        className={styles.document}
                        key={`${file.server}-${file.fileName}`}
                      >
                        <td>
                          {file.server === 'Internal Server' && (
                            <a
                              className={styles.documentLink}
                              target="_blank"
                              href={`${process.env.DOC_API_URL}/viewer/?file=${file.fileName}`}
                            >
                              {file.hasThumbnail ? (
                                <div
                                  className={styles.thumbnail}
                                  style={{ backgroundImage: `url(${process.env.DOC_API_URL}/uploads/${file.fileName}` }}
                                />
                              ) : (
                                <img
                                  className={styles.documentIcon}
                                  src={`${process.env.PUBLIC_URL}icons/document.svg`}
                                />
                              )}
                              {file.fileName}
                            </a>
                          )}
                          {file.server !== 'Internal Server' && (
                            <a
                              className={styles.documentLink}
                              target="_blank"
                              href={file.fileUrl}
                            >
                              {file.hasThumbnail ? (
                                <div
                                  className={styles.thumbnail}
                                  style={{ backgroundImage: `url(${file.fileUrl}` }}
                                />
                              ) : (
                                <img
                                  className={styles.documentIcon}
                                  src={`${process.env.PUBLIC_URL}icons/document.svg`}
                                />
                              )}
                              {file.fileName}
                            </a>
                          )}
                        </td>
                        <td>
                          <div className={styles.flexContainer}>
                            {file.server}
                            <ModalLink
                              content={getModalContent(
                                file.fileName,
                                file.server
                              )}
                            >
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
