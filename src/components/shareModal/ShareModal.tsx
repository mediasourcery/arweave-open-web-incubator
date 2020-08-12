import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { deleteSharedApi } from '../../apis/files/deleteSharedApi';
import { getSharedApi } from '../../apis/files/getSharedApi';
import { shareFileApi } from '../../apis/files/shareFileApi';
import { IFileType } from '../../routes/documents/DocumentsRoute';
import { Button } from '../button/Button';
import { Dropdown } from '../dropdown/Dropdown';
import { IconButton } from '../icon-button/IconButton';
import { TextField } from '../text-field/TextField';
import styles from './ShareModal.scss';

const ShareModal = (props) => {
  const { register, watch, errors, handleSubmit } = useForm();
  const [dropdown, setDropdown] = useState<'email' | 'phone'>('email');
  const [errorMessage, setErrorMessage] = useState<String>('');
  const [successMessage, setSuccessMessage] = useState<String>('');
  const [usersList, setUsersList] = useState<Array<any>>([]);
  const { filename } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e) => {
    setDropdown(e.currentTarget.value)
  }

  const handleDelete = async (token) => {
    try {
      await deleteSharedApi(token);
      setSuccessMessage('Successfully deleted shared token');
    } catch (err) {
      setErrorMessage('Failed to delete token');
    }
  }

  const onSubmit = async data => {
    try {
      await shareFileApi({
        type: 'post',
        file: filename,
        name: data.name,
        method: data.method,
        email: data.email,
        phone: data.phone
      });
      await listUsers(filename);
      setSuccessMessage('Successfully shared');
    } catch (err) {
      setErrorMessage('There was an error.');
    }
  };

  const listUsers = async (file: IFileType) => {
    try {
      const result = await getSharedApi(file);
      setUsersList(result.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMessage(`You do not have permission to view shared tokens for this file.`);
      } else {
      }
    }
  }

  useEffect(() => {
    listUsers(filename);
    setDropdown('email')
  }, [])

  useEffect(() => {
    if (successMessage.length) {
      setErrorMessage('');
      listUsers(filename);
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage.length) {
      setSuccessMessage('');
      listUsers(filename);
    }
  }, [errorMessage])


  const dropdownProps = {
    name: 'method',
    onChange: handleChange,
    ref: register,
    options: ['email', 'phone']
  }

  return (
    <>
      <div className={styles.modalMessage}>
        Share Document
      </div>
      {usersList.length > 0 &&
        (
          <>
            <p>Shared with:</p>
            <ul className={styles.shareList}>
              {usersList.map((user, id) => {
                return (
                  <li key={id}>
                    <IconButton
                      onClick={() => {
                        handleDelete(user.token)
                      }}
                      className={styles.actionBtn}
                      disabled={isDeleting}
                      image="icons/delete-primary.svg"
                      title="Delete Service"
                    />
                    {user.email && user.email}
                    {user.phone && user.phone}
                  </li>
                )
              })}
            </ul>
          </>
        )
      }

      <form onSubmit={handleSubmit(onSubmit)} className={styles.shareForm}>
        <TextField
          type="text"
          name="name"
          label="Name"
          placeholder="Your Name"
          ref={register}
        ></TextField>
        <TextField
          type="text"
          name="ownerEmail"
          label="Your Email"
          placeholder="Your Email"
          ref={register}
        ></TextField>
        <label htmlFor="method">
          Method
        </label>
        <Dropdown
          {...dropdownProps}
        >
        </Dropdown>
        <TextField
          type="text"
          name={dropdown}
          label={dropdown === 'email' ? 'Email Address' : 'Phone Number'}
          placeholder={dropdown === 'email' ? 'Email' : 'Phone'}
          ref={register}
        ></TextField>
        <Button type="submit">Submit</Button>
        {errorMessage && (
          <div className={styles.messageError}>{errorMessage}</div>
        )}
        {successMessage && (
          <div className={styles.messageSuccess}>{successMessage}</div>
        )}
      </form>
    </>
  )
}

export const ShareModalContent: React.FunctionComponent = (props) => {
  {
    return (
      <>
        <ShareModal filename={props}></ShareModal>
      </>
    );
  };
}