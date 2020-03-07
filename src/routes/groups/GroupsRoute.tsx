import * as crypto from 'crypto';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';

import {
  getGroupsApi,
  deleteGroupApi
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

import styles from './GroupsRoute.scss';

export const GroupsRoute: React.FunctionComponent = () => {
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [isLoading, setIsLoading] = useState(true);
  const [groupList, setGroupList] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadGroups = async () => {
    try {
      const groups = await getGroupsApi();

      setGroupList(
        groups.data.sort((a, b) => {
          if (a < b) {
            return -1;
          } else if (a > b) {
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
    setPage('groups');
    setBreadcrumbs([{text: 'Groups', url: 'groups'}])
    loadGroups();
  }, []);

  const deleteGroup = async index => {
    const groupToDelete = groupList[index];
    if (
      !confirm(
        `Are you sure you want to delete this group?\nGID: ${groupToDelete}`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteGroupApi(groupToDelete.substr(1));
      loadGroups();
    } catch (error) {
      setErrorMessage(error.message);
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ContentBox>
      <PageHeader header="Groups">
        <ButtonLink page="groups/new">New Group</ButtonLink>
      </PageHeader>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      {groupList.map((group, index) => (
        <div className={styles.group} key={group}>
          <div className={styles.groupInfo}>
            <div className={styles.groupName}>{group}</div>
          </div>
          <div className={styles.groupActions}>
            <IconButton
              className={styles.actionBtn}
              disabled={isSubmitting}
              image="icons/delete-primary.svg"
              onClick={() => deleteGroup(index)}
              title="Delete Group"
            />
          </div>
        </div>
      ))}
    </ContentBox>
  );
};
