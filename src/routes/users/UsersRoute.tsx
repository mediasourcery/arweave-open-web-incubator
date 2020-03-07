import * as crypto from 'crypto';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';

import {
  IGetUsersApiResponseData,
  getUsersApi,
  deleteUserApi
} from '../../apis';

import {
  Loader,
  Button,
  ContentBox,
  PageHeader,
  ButtonLink,
  IconButton,
  Icon
} from '../../components';

import { PageContext, BreadcrumbsContext } from '../../contexts';

import styles from './UsersRoute.scss';

export const UsersRoute: React.FunctionComponent = () => {
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState<IGetUsersApiResponseData[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = async () => {
    try {
      const users = await getUsersApi();

      setUserList(
        users.data.sort((a, b) => {
          if (a.uid < b.uid) {
            return -1;
          } else if (a.uid > b.uid) {
            return 1;
          }
          return 0;
        })
      );
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = `${process.env.AUTH_UI_AUTHORIZE_URL}?client_id=${process.env.AUTH_UI_CONSOLE_CLIENT_ID}`;
      }
      console.log(error);
    }
  };

  useEffect(() => {
    setPage('users');
    setBreadcrumbs([{text: 'Users', url: 'users'}])
    loadUsers();
  }, []);

  const deleteUser = async index => {
    event.preventDefault()
    const userToDelete = userList[index];
    if (
      !confirm(
        `Are you sure you want to delete this user?\nUID: ${userToDelete.uid}\nEmail: ${userToDelete.email}`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteUserApi({
        uid: userToDelete.uid,
        email: userToDelete.email
      });
      loadUsers();
    } catch (error) {
      setErrorMessage(error.message);
    }

    setIsSubmitting(false);
  };

  const editUser = async (index, e) => {
    if(e.target.id == 'userEmail'){
      event.stopPropagation()
    } else {
      navigate(`${process.env.PUBLIC_URL}users/${userList[index].uid || userList[index].email}/edit`);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ContentBox>
      <PageHeader header="Users">
        <ButtonLink page="users/new">New User</ButtonLink>
      </PageHeader>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      {userList.map((user, index) => (
        <div className={styles.user} key={user.uid}>
          <div className={styles.userType}>
            <Icon
              className={styles.userEnabled}
              image={`icons/${
                user.status === 'active'
                  ? 'checkmark'
                  : user.status === 'locked'
                  ? 'x'
                  : 'setup'
              }.svg`}
              size={16}
              title={
                user.status === 'active'
                  ? 'Activee'
                  : user.status === 'locked'
                  ? 'Locked'
                  : 'Setup'
              }
            />
            <div className={styles.userAvatar}>
              <Icon image={`https://www.gravatar.com/avatar/${crypto.createHash('md5').update(user.email || '').digest('hex').toString()}`} size={36} title="User" />
            </div>
          </div>
          <div className={styles.userInfo} onClick={(e) => editUser(index, e)}>
            <div className={styles.userName}>{user.uid}</div>
            <div>
              {user.email && (
                <a id='userEmail' href={`mailto:${user.email}`}>
                  {user.email}
                </a>
              )}
              {!user.email && (
                <div className={styles.na}>
                  no email provided
                </div>
              )}
            </div>
          </div>
          <div className={styles.userActions}>
            <IconButton
              className={styles.actionBtn}
              disabled={isSubmitting}
              image="icons/delete-primary.svg"
              onClick={() => deleteUser(index)}
              title="Delete User"
            />
          </div>
        </div>
      ))}
    </ContentBox>
  );
};
