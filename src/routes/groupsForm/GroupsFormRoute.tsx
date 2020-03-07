import { Redirect } from '@reach/router';
import * as React from 'react';
import { FormEvent, useContext, useEffect, useState } from 'react';

import {
  getGroupsApi,
  createGroupApi,
  createCapabilityApi,
  setAttributesApi,
  getAttributesApi,
  getCapabilitiesApi,
  deleteCapabilityApi
} from '../../apis';

import {
  Loader,
  Button,
  ContentBox,
  PageHeader,
  TextField,
  IconButton
} from '../../components';

import { PageContext, BreadcrumbsContext } from '../../contexts';

import styles from './GroupsFormRoute.scss';

interface IProps {
  path: string;
  groupUid: string;
}

export const GroupsFormRoute: React.FunctionComponent<IProps> = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [groupList, setGroupList] = useState<string[]>([]);

  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const initialFormState = {
    parentGid: '/',
    gid: ''
  };
  const [form, setFormValues] = useState<{
    parentGid: string;
    gid: string;
  }>(initialFormState);

  const updateForm = e => {
    const name = e.target.name;
    const value = e.target.value;

    setFormValues({
      ...form,
      [name]: value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadGroups = async () => {
    setIsLoading(true);
    const groups = await getGroupsApi();
    setIsLoading(false);

    setGroupList(groups.data);
  };

  useEffect(() => {
    setPage('groups');
    if (props.path.includes('new')) {
      setBreadcrumbs([{text: 'Groups', url: 'groups'}, {text: 'New Group', url: 'groups/new'}])
    } else {
      setBreadcrumbs([{text: 'Groups', url: 'groups'}])
    }
    loadGroups();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (props.path.includes('new')) {
      if (form.gid.includes('/')) {
        setErrorMessage('GID must not contain a slash (ie. "/")');
        setIsSubmitting(false);
        return;
      }

      try {
        await createGroupApi({
          gid: form.gid,
          parentGid: form.parentGid,
        });
        setFormValues(initialFormState);
        loadGroups();
        setShouldRedirect(true);
      } catch (error) {
        if (error.response?.data?.errors) {
          setErrorMessage(error.response?.data?.errors[0].message);
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('An unknown error occurred. Please try again.');
        }
      }
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (shouldRedirect) {
    return <Redirect to={`${process.env.PUBLIC_URL}groups`} />;
  }

  return (
    <ContentBox>
      <form onSubmit={handleSubmit}>
        <PageHeader
          header={props.path.includes('new') ? 'New Group' : 'Edit Group'}
        >
          <div className={styles.actions}>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            <Button
              styleOverride={styles.submitBtn}
              disabled={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </div>
        </PageHeader>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="parentGid">
            Parent GID
          </label>
          <select
            className={styles.input}
            value={form.parentGid}
            onChange={event => updateForm(event)}
            name="parentGid"
          >
            <option value="/">/</option>
            {groupList.map((group, index) => (
              <option value={group} key={index}>{group}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <TextField
            label="GID"
            name="gid"
            disabled={props.path.includes('edit')}
            placeholder="Enter a new gid"
            onChange={event => updateForm(event)}
            value={form.gid}
          />
        </div>

      </form>
    </ContentBox>
  );
};
