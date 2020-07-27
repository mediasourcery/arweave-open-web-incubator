import { and, equals } from 'arql-ops';
import { deleteFile, getFileUrl, listFiles } from 'blockstack';
import * as IPFS from 'ipfs';
import * as path from 'path';
import * as React from 'react';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DndProvider,



  DropTargetMonitor, useDrag, useDrop
} from 'react-dnd';
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend';
import {
  Button,
  ContentBox, Icon,
  IconButton,
  Interaction,
  Loader, ModalLink,






  PageHeader
} from '../../components';
import {
  ArweaveContext,
  BreadcrumbsContext,
  ModalContext,
  PageContext
} from '../../contexts';
import { decodeToken, redirectToLogin } from '../../utils';
import styles from './DocumentsRoute.scss';

interface IFileType {
  fileName: string;
  server: string;
  hasThumbnail: boolean;
}

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


  const [currentFile, setCurrentFile] = useState<any>(null);

  const {
    arweave,
    arweaveKey,
    walletAddress,
  } = useContext(ArweaveContext);
  const [arweaveLink, setArweaveLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactions, setTransactions] = useState([]);

  const handleDrop = async props => {
    // Read the file as Data URL (since we accept only images)
    const result = await fetch(`${process.env.DOC_API_URL}/uploads/view/${currentFile.src}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(myBlob => {
        handleArweaveUpload(myBlob);
        setCurrentFile(null);
      })
      .catch(error => {
        console.error(
          'There has been a problem with your fetch operation:',
          error
        );
      });
  };

  const handleArweaveUpload = async file => {
    let transaction;
    let response;

    if (!arweaveKey) {
      setErrorMessage('No arweave wallet found. Please log in and try again.');
      setIsLoading(false);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async ev => {
      // @ts-ignore
      const filetoRead = new Uint8Array(ev.target.result);
      setIsLoading(false);

      try {
        transaction = await arweave.createTransaction(
          {
            data: filetoRead
          },
          arweaveKey
        );

        transaction.addTag('Content-Type', file.type);
      } catch {
        setErrorMessage('Failed to create transaction. Please try again.');
        setIsLoading(false);
      }

      try {
        await arweave.transactions.sign(transaction, arweaveKey);
      } catch (err) {
        setErrorMessage('Failed to sign transaction. Please try again.');
        setIsLoading(false);
      }

      try {
        response = await arweave.transactions.post(transaction);
      } catch (err) {
        setErrorMessage('Failed to post transaction. Please try again.');
        setIsLoading(false);
      }

      if (response.status === 200 || response.status === 202) {
        setErrorMessage('');
        setSuccessMessage(
          `Document uploaded successfully! Here's your transaction id: ${transaction.id}`
        );

        setArweaveLink(
          `${arweave.api.config.protocol}://${arweave.api.config.host}:${arweave.api.config.port}/${transaction.id}`
        );

        setIsLoading(false);
      }

      return response;
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleFileDrop = useCallback(
    (item: any, monitor: DropTargetMonitor) => {
      if (monitor) {
        if (currentFile) {
          handleDrop(item);
        } else if (monitor.getItem().files) {
          const files = monitor.getItem().files[0];
          handleArweaveUpload(files);
        }
      }
    },
    [arweaveKey, currentFile, setCurrentFile]
  );

  interface TargetBoxProps {
    onDrop: (props: TargetBoxProps, monitor: DropTargetMonitor) => void;
    className: string;
  }

  const TargetBox: React.FC<TargetBoxProps> = props => {
    const { onDrop, children, className } = props;
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ['tr', NativeTypes.FILE],
      drop: (item, monitor) => {
        if (onDrop && !currentFile) {
          onDrop(props, monitor);
        } else if (onDrop && currentFile) {
          handleDrop(children);
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
      })
    });

    return (
      <div ref={drop} className={className}>
        Drag files into Arweave
        {isOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              zIndex: 1,
              opacity: 0.5,
              backgroundColor: 'yellow'
            }}
          />
        )}
      </div>
    );
  };

  const getArweaveDocs = async () => {
    const myQuery = and(equals('from', walletAddress));

    let results;

    try {
      results = await arweave.arql(myQuery);
    } catch (err) {
      console.log('failed to fetch arweave');
    }
    let finalResults;

    try {
      finalResults = await Promise.all(
        results.map(async transaction => {
          let newTx;
          let tags;
          let fileName;
          let hasThumbnail;
          let fileType;
          let fullFileType;
          let fileDate;
          let sig;

          try {
            await arweave.transactions.get(transaction).then(transaction => {
              try {
                sig = transaction.get('signature');
              } catch (err) {
                console.log("couldn't get sig");
              }

              try {
                newTx = transaction.get('data');
              } catch (err) {
                console.log("couldn't get tx data");
              }

              try {
                tags = transaction.get('tags').map(tag => {
                  let key = tag.get('name', { decode: true, string: true });
                  let value = tag.get('value', { decode: true, string: true });

                  if (key === 'Content-Type') {
                    fileType = value.split('/')[1].toUpperCase();
                  }

                  if (key === 'File-Name') {
                    fileName = value;
                  }

                  if (key === 'Upload-Date') {
                    fileDate = value;
                  }

                  if (
                    key === 'Content-Type' &&
                    (value === 'image/jpeg' ||
                      value === 'image/png' ||
                      value === 'image/gif')
                  ) {
                    hasThumbnail = true;
                    fullFileType = value;
                  }

                  return {
                    [key]: value
                  };
                });
              } catch (err) {
                console.log('no tags');
              }
            });

            if (transaction) {
              return {
                fileType: fileType,
                fileName: fileName ? fileName : transaction,
                fileDate,
                file: newTx,
                fileUrl: `${arweave.api.config.protocol}://${arweave.api.config.host}:${arweave.api.config.port}/${transaction}`,
                tags,
                transaction,
                server: 'Arweave',
                hasThumbnail
              };
            }
          } catch (err) {
            console.log('error getting transaction');
          }
        })
      );
      return finalResults;
    } catch (err) {
      console.log('failed to get all transactions');
    }
  };

  const getDocuments = async () => {
    setIsLoading(true);

    const headers = new Headers();
    headers.delete('Content-Type');

    try {
      const files = [];
      const response = await fetch(`${process.env.DOC_API_URL}/uploads`, {
        method: 'get',
        headers
      });

      const json = await response.json();


      if (json) {
        typeof json.moved === 'string' && setResponse(json.moved);
        Object.values(json.data).map((file: string) => {

          const url = file ? file.split(`${process.env.DOC_API_URL}/uploads/view/`)[1] : ''

          files.push({
            fileName: encodeURI(url),
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

      const isNull = value => typeof value === 'object' && !value;

      if (walletAddress && !isNull(walletAddress)) {
        let arweaveFiles;

        try {
          arweaveFiles = await getArweaveDocs();

          arweaveFiles.map(file => {
            if (file) {
              files.push(file);
            }
          });
        } catch (err) {
          console.log('failed to get arweave docs');
        }
      }

      if (localStorage.getItem('connectState')) {
        const uport = new uportconnect('TestApp', {
          network: 'mainnet',
          bannerImage: {
            '/': '/ipfs/QmQf1uGU7M9vSv3gFEmU36g1idim7hhtbog8yBnYCy7Psz'
          }
        });

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
      await getDocuments();
      setShowModal(false);
    } catch (err) {
      setModalError('Failed to delete document.');
    }
  };

  const handleDelete = async fileName => {
    setModalError('');
    const headers = new Headers();

    try {
      const response = await fetch(
        `${process.env.DOC_API_URL}/uploads/${fileName}`,
        {
          method: 'DELETE',
          headers
        }
      );
      const json = await response.json();
      if (json) {
        console.log('DELETE response: ', json);
        await getDocuments();
      }
      setShowModal(false);
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
    if (localStorage.getItem('connectState')) {
      setIpfsNode(await IPFS.create());
    } else {
      getDocuments();
    }
  };

  useEffect(() => {
    getDocuments();
    setErrorMessage('');
    setSuccessMessage('');
  }, [walletAddress]);

  useEffect(() => {
    setPage('documents');
    // getDocuments();
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

  const getClassName = (className, isActive) => {
    if (!isActive) return className;
    return `${className} ${className}-active`;
  };

  const moveImage = (dragIndex, hoverIndex) => {
    // Get the dragged element
  };

  const FileList = ({ files, moveImage }) => {
    const type = 'tr'; // Need to pass which type element can be draggable, its a simple string or Symbol. This is like an Unique ID so that the library know what type of element is dragged or dropped on.

    const renderRow = (file, index) => {
      const ref = useRef(null); // Initialize the reference
      // useDrop hook is responsible for handling whether any item gets hovered or dropped on the element
      const [, drop] = useDrop({
        // Accept will make sure only these element type can be droppable on this element
        accept: type,
        hover(item) {
          if (!ref.current) {
            return;
          }

          // @ts-ignore
          const dragIndex = item.index;
          // current element where the dragged element is hovered on
          const hoverIndex = index;
          // If the dragged element is hovered in the same place, then do nothing
          if (dragIndex === hoverIndex) {
            return;
          }
          // If it is dragged around other elements, then move the image and set the state with position changes
          moveImage(dragIndex, hoverIndex);
          /*
            Update the index for dragged item directly to avoid flickering
            when the image was half dragged into the next
          */
          // @ts-ignore
          item.index = hoverIndex;
          setCurrentFile(item);
        }
      });

      // useDrag will be responsible for making an element draggable. It also expose, isDragging method to add any styles while dragging
      const [{ isDragging }, drag] = useDrag({
        // item denotes the element type, unique identifier (id) and the index (position)
        item: { type, id: file.id, index, src: file.fileName },
        // collect method is like an event listener, it monitors whether the element is dragged and expose that information
        collect: monitor => ({
          isDragging: monitor.isDragging()
        })
      });

      /* 
        Initialize drag and drop into the element using its reference.
        Here we initialize both drag and drop on the same element)
      */
      drag(drop(ref));
      return (
        <tr
          className={styles.document}
          key={`${file.server}-${file.fileName}-${file.transaction && file.transaction}`}
          ref={file.server === 'Internal Server' ? ref : null}
        >
          <td>
            <div className={styles.flexContainer}>
              {file.server === 'Internal Server' && walletAddress && (<div className={styles.draggable} style={{ opacity: isDragging ? 0.5 : 1 }}></div>)}
              {file.server === 'Internal Server' && (
                <a
                  className={styles.documentLink}
                  target="_blank"
                  href={`${process.env.DOC_API_URL}/uploads/view/${file.fileName}`}
                >
                  {file.hasThumbnail ? (
                    <div
                      className={styles.thumbnail}
                      style={{
                        backgroundImage: `url(${process.env.DOC_API_URL}/uploads/view/${file.fileName}`
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
              {file.server === 'Arweave' && (
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
              {file.server !== 'Internal Server' && file.server !== 'Arweave' && (
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
              {file.server !== 'Arweave' && (
                <ModalLink
                  content={getModalContent(file.fileName, file.server)}
                >
                  <IconButton
                    className={styles.actionBtn}
                    disabled={isDeleting}
                    image="icons/delete-primary.svg"
                    title="Delete Service"
                  />
                </ModalLink>
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
            </div>
          </td>
          <td>
            <div className={styles.flexContainer}>{file.server}</div>
          </td>
          <td>
            {file.server !== 'Arweave'
              ? file.fileName
                .split('.')
              [file.fileName.split('.').length - 1].toUpperCase()
              : file.fileType}
          </td>
        </tr>
      );
    };

    return files.map(renderRow);
  };

  return (
    <ContentBox>
      <DndProvider backend={HTML5Backend}>
        <PageHeader header="Documents"></PageHeader>
        <div className={styles.messageContainer}>
          {successMessage ? (
            <div className={styles.messageSuccess}>{successMessage}</div>
          ) : null}
          {arweaveLink && successMessage && walletAddress ? (
            <div className={styles.messageSuccess}>
              <a href={arweaveLink} target="_blank">
                <Button styleOverride={styles.button}>View File</Button>
              </a>
            </div>
          ) : null}
          {errorMessage ? (
            <div className={styles.messageError}>{errorMessage}</div>
          ) : null}

          {walletAddress ? (
            <TargetBox
              onDrop={handleFileDrop}
              children=""
              className={styles.fileInput}
            />
          ) : null}
        </div>

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
                        <FileList files={filesArray} moveImage={moveImage} />
                      )}
                  </tbody>
                </table>
              </div>
            )
          )}
      </DndProvider>
    </ContentBox>
  );
};
