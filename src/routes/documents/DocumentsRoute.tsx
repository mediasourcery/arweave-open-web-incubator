import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../../utils';
import { deleteFile, getFile, getFileUrl, listFiles } from 'blockstack';
import {
  ModalLink,
  Icon,
  IconButton,
  Interaction,
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

  const [orderBy, setOrderBy] = useState<'fileName' | 'fileType' | 'server'>(
    'fileName'
  );
  const [sorting, setSorting] = useState<'asc' | 'desc'>('asc');

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
          files.push({ fileName: file, server: 'Internal Server' });
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
            server: 'GAIA Server'
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
      const response = await deleteFile(name);
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

    const files = [];

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
    const newFilesArray = filesArray.slice().sort((a, b) => {
      if (orderBy === 'fileName') {
        if (a.fileName.toLowerCase() < b.fileName.toLowerCase()) {
          return sorting === 'desc' ? 1 : -1;
        } else if (a.fileName.toLowerCase() > b.fileName.toLowerCase()) {
          return sorting === 'desc' ? -1 : 1;
        }
      }
      if (orderBy === 'fileType') {
        const splitFileNameA = a.fileName.split('.');
        const splitFileNameB = b.fileName.split('.');
        if (
          splitFileNameA[splitFileNameA.length - 1].toLowerCase() <
          splitFileNameB[splitFileNameB.length - 1].toLowerCase()
        ) {
          return sorting === 'desc' ? 1 : -1;
        } else if (
          splitFileNameA[splitFileNameA.length - 1].toLowerCase() >
          splitFileNameB[splitFileNameB.length - 1].toLowerCase()
        ) {
          return sorting === 'desc' ? -1 : 1;
        }
      }
      if (orderBy === 'server') {
        if (a.server < b.server) {
          return sorting === 'desc' ? 1 : -1;
        } else if (a.server > b.server) {
          return sorting === 'desc' ? -1 : 1;
        }
      }
      return 0;
    });
    setFilesArray(newFilesArray);
  }, [orderBy, sorting, isLoading]);

  const sortTable = (newOrderBy: 'fileName' | 'fileType' | 'server') => {
    setOrderBy(newOrderBy);
    if (orderBy === newOrderBy) {
      setSorting(sorting === 'asc' ? 'desc' : 'asc');
    }
  };

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
                  <th>
                    <Interaction onClick={() => sortTable('fileName')}>
                      File Name
                      <Icon
                        image={
                          orderBy === 'fileName' && sorting === 'asc'
                            ? 'icons/sort-asc.svg'
                            : orderBy === 'fileName' && sorting === 'desc'
                            ? 'icons/sort-desc.svg'
                            : 'icons/sort.svg'
                        }
                        size={14}
                        className={styles.sortIcon}
                      />
                    </Interaction>
                  </th>
                  <th>
                    <Interaction onClick={() => sortTable('server')}>
                      Server
                      <Icon
                        image={
                          orderBy === 'server' && sorting === 'asc'
                            ? 'icons/sort-asc.svg'
                            : orderBy === 'server' && sorting === 'desc'
                            ? 'icons/sort-desc.svg'
                            : 'icons/sort.svg'
                        }
                        size={14}
                        className={styles.sortIcon}
                      />
                    </Interaction>
                  </th>
                  <th>
                    <Interaction onClick={() => sortTable('fileType')}>
                      File Type
                      <Icon
                        image={
                          orderBy === 'fileType' && sorting === 'asc'
                            ? 'icons/sort-asc.svg'
                            : orderBy === 'fileType' && sorting === 'desc'
                            ? 'icons/sort-desc.svg'
                            : 'icons/sort.svg'
                        }
                        size={14}
                        className={styles.sortIcon}
                      />
                    </Interaction>
                  </th>
                </tr>
                {filesArray.length < 1 ? (
                  <tr>
                    <td colSpan={3}>No files located on server.</td>
                  </tr>
                ) : (
                  filesArray.map((file, index) => (
                    <tr
                      className={styles.document}
                      key={`${file.server}-${file.fileName}`}
                    >
                      <td>
                        <div className={styles.flexContainer}>
                          {file.server === 'Internal Server' && (
                            <a
                              target="_blank"
                              href={`${process.env.DOC_API_URL}/viewer/?file=${file.fileName}`}
                            >
                              {file.fileName}
                            </a>
                          )}
                          {file.server !== 'Internal Server' && (
                            <a target="_blank" href={file.fileUrl}>
                              {file.fileName}
                            </a>
                          )}
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
                      <td>
                        <div className={styles.flexContainer}>
                          {file.server}
                        </div>
                      </td>
                      <td>
                        {file.fileName
                          .split('.')
                          [file.fileName.split('.').length - 1].toUpperCase()}
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
