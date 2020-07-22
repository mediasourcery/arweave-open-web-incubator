import * as IPFS from 'ipfs';
import * as React from 'react';
import * as path from 'path';
import { FC, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../../utils';
import { deleteFile, getFileUrl, listFiles } from 'blockstack';
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

  const [ipfsNode, setIpfsNode] = useState();

  const uport = new uportconnect('TestApp', {
    network: 'mainnet',
    bannerImage: {
      '/': '/ipfs/QmQf1uGU7M9vSv3gFEmU36g1idim7hhtbog8yBnYCy7Psz'
    }
  });

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

      if (token?.sub?.includes('blockstack')) {
        const gaiaFiles = await getGaiaServerDocuments();
        gaiaFiles.map(gaiaFile => {
          files.push(gaiaFile);
        });
      }

      if (localStorage.connectState) {
        uport.requestDisclosure({ verified: ['Document'] }, 'disclosureReq');

        const res = await uport.onResponse('disclosureReq');

        files.push({
          fileName: res.payload.Document.Name,
          // fileUrl: `data:${res.payload.Document.Type};base64,${btoa(
          //   Buffer.concat(chunks).toString()
          // )}`,
          fileUrl: `https://ipfs.io/ipfs/${res.payload.Document.Hash}`,
          server: 'IPFS',
          hasThumbnail: determineIfThumbnail(res.payload.Document.Name)
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

  const load = async () => {
    setIpfsNode(await IPFS.create());
  };

  useEffect(() => {
    setPage('documents');
    setBreadcrumbs([
      {
        text: 'Documents',
        url: 'documents'
      }
    ]);
    load();
  }, []);

  useEffect(() => {
    if (ipfsNode) {
      getDocuments();
    }
  }, [ipfsNode]);

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
                              className={styles.documentLink}
                              target="_blank"
                              href={`${process.env.DOC_API_URL}/viewer/?file=${file.fileName}`}
                            >
                              {file.hasThumbnail ? (
                                <div
                                  className={styles.thumbnail}
                                  style={{
                                    backgroundImage: `url(${process.env.DOC_API_URL}/uploads/${file.fileName}`
                                  }}
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
                          {file.server === 'GAIA Server' && (
                            <a
                              className={styles.documentLink}
                              target="_blank"
                              href={file.fileUrl}
                            >
                              {file.hasThumbnail ? (
                                <div
                                  className={styles.thumbnail}
                                  style={{
                                    backgroundImage: `url(${file.fileUrl}`
                                  }}
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
                          {file.server === 'IPFS' && (
                            <a
                              className={styles.documentLink}
                              target="_blank"
                              href={file.fileUrl}
                            >
                              {file.hasThumbnail ? (
                                <div
                                  className={styles.thumbnail}
                                  style={{
                                    backgroundImage: `url(${file.fileUrl}`
                                  }}
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
