import { Redirect } from '@reach/router';
import * as React from 'react';
import { FormEvent, useContext, useEffect, useState } from 'react';

import {
  IGetUsersApiResponseData,
  getUsersApi,
  createUserApi,
  editUserApi,
  setPasswordApi,
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

import styles from './UsersFormRoute.scss';

interface IProps {
  path: string;
  userUid: string;
  uri: string;
}

export const UsersFormRoute: React.FunctionComponent<IProps> = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [userList, setUserList] = useState<IGetUsersApiResponseData[]>([]);
  const [originalCapabilities, setOriginalCapabilities] = useState<
    {
      name: string;
      target: string;
    }[]
  >([]);

  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const initialFormState = {
    uid: '',
    email: '',
    password: '',
    status: '',
    attributes: [],
    capabilities: []
  };
  const [form, setFormValues] = useState<{
    uid: string;
    email: string;
    password: string;
    status: string;
    attributes: {
      key: string;
      value: string;
    }[];
    capabilities: {
      name: string;
      target: string;
    }[];
  }>(initialFormState);

  const updateForm = e => {
    const name = e.target.name;
    const value = e.target.value;

    setFormValues({
      ...form,
      [name]: value
    });
  };

  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  const [newCapabilityName, setNewCapabilityName] = useState('');
  const [newCapabilityTarget, setNewCapabilityTarget] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const removeAttribute = index => {
    const updatedAttributes = [...form.attributes];
    updatedAttributes.splice(index, 1);

    setFormValues({
      ...form,
      attributes: updatedAttributes
    });
  };

  const addAttribute = () => {
    const newAttribute = {
      key: newAttributeKey,
      value: newAttributeValue
    };

    const updatedAttributes = form.attributes.concat(newAttribute);

    setFormValues({
      ...form,
      attributes: updatedAttributes
    });

    setNewAttributeKey('');
    setNewAttributeValue('');
  };

  const removeCapability = index => {
    const updatedCapabilities = [...form.capabilities];
    updatedCapabilities.splice(index, 1);

    setFormValues({
      ...form,
      capabilities: updatedCapabilities
    });
  };

  const addCapability = () => {
    const newCapability = {
      name: newCapabilityName,
      target: newCapabilityTarget
    };

    const updatedCapabilities = form.capabilities.concat(newCapability);

    setFormValues({
      ...form,
      capabilities: updatedCapabilities
    });

    setNewCapabilityName('');
    setNewCapabilityTarget('');
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const users = await getUsersApi();
    setIsLoading(false);

    setUserList(users.data);

    if (props.userUid) {
      const userToEdit = users.data.find(user => user.uid === props.userUid || user.email === props.userUid);

      const { data: attributesData } = await getAttributesApi(props.userUid);
      const { data: capabilitiesData } = await getCapabilitiesApi(
        props.userUid
      );

      const attributes = [];
      Object.entries(attributesData[0].attributes.data).forEach(
        ([key, values]) => {
          attributes.push({
            key,
            value: values[0]
          });
        }
      );

      const capabilities = [];
      capabilitiesData.forEach(capability => {
        capabilities.push({
          name: capability.capability.name,
          target: capability.capability.target
        });
      });
      setOriginalCapabilities(capabilities);

      setFormValues({
        uid: userToEdit.uid || '',
        email: userToEdit.email || '',
        password: '',
        status: userToEdit.status || '',
        attributes,
        capabilities
      });
    }
  };

  useEffect(() => {
    setPage('users');
    if (props.path.includes('new')) {
      setBreadcrumbs([{text: 'Users', url: 'users'}, {text: 'New User', url: 'users/new'}])
    } else if (props.path.includes('edit')) {
      setBreadcrumbs([{text: 'Users', url: 'users'}, {text: 'Edit User', url: props.uri.substr(1)}])
    } else {
      setBreadcrumbs([{text: 'Users', url: 'users'}])
    }
    loadUsers();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (props.path.includes('new')) {
      if (form.uid == '') {
        setErrorMessage('Must select uid');
        setIsSubmitting(false);
        return;
      }

      try {
        await createUserApi({
          email: form.email,
          password: form.password,
          status: form.status,
          uid: form.uid
        });
        const attributes: {
          [key: string]: string[];
        } = {};
        form.attributes.forEach(attribute => {
          attributes[attribute.key] = [attribute.value];
        });
        await setAttributesApi({
          owner: form.uid,
          attributes
        });
        await Promise.all(
          form.capabilities.map(async capability => {
            await createCapabilityApi({
              owner: form.uid,
              name: capability.name,
              target: capability.target
            });
          })
        );
        setFormValues(initialFormState);
        loadUsers();
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

    if (props.path.includes('edit')) {
      try {
        // await editUserApi({
        //   email: form.email,
        //   status: form.status,
        //   uid: form.uid
        // });
        if (form.password && form.password !== "") {
          await setPasswordApi({
            password: form.password,
            email: form.email,
            uid: form.uid
          });
        }
        const attributes: {
          [key: string]: string[];
        } = {};
        form.attributes.forEach(attribute => {
          attributes[attribute.key] = [attribute.value];
        });
        await setAttributesApi({
          owner: form.uid,
          attributes
        });
        await Promise.all(
          form.capabilities.map(async capability => {
            await createCapabilityApi({
              owner: form.uid,
              name: capability.name,
              target: capability.target
            });
          })
        );
        await Promise.all(
          originalCapabilities
            .filter(
              originalCapability =>
                !form.capabilities.find(
                  capability => capability.name === originalCapability.name
                )
            )
            .map(async originalCapability => {
              await deleteCapabilityApi({
                owner: form.uid || form.email,
                name: originalCapability.name,
                target: originalCapability.target
              });
            })
        );
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
    return <Redirect to={`${process.env.PUBLIC_URL}users`} />;
  }

  return (
    <ContentBox>
      <form onSubmit={handleSubmit}>
        <PageHeader
          header={props.path.includes('new') ? 'New User' : 'Edit User'}
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
          <TextField
            label="UID"
            name="uid"
            disabled={props.path.includes('edit')}
            placeholder="Enter a new uid"
            onChange={event => updateForm(event)}
            value={form.uid}
          />
        </div>

        <div className={styles.field}>
          <TextField
            label="Email"
            name="email"
            placeholder="Enter a new email"
            onChange={event => updateForm(event)}
            value={form.email}
          />
        </div>

        <div className={styles.field}>
          <TextField
            label="Password"
            name="password"
            placeholder="Enter a new password"
            onChange={event => updateForm(event)}
            type="password"
            value={form.password}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="type">
            Status
          </label>
          <select
            className={styles.input}
            value={form.status}
            onChange={event => updateForm(event)}
            name="status"
          >
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="setup">Setup</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Attributes</label>
          <table cellPadding={15} cellSpacing={0} className={styles.table}>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {form.attributes.map((attribute, index) => (
                <tr key={index}>
                  <td>
                    <div title={attribute.key}>{attribute.key}</div>
                  </td>
                  <td>
                    <div title={attribute.value}>{attribute.value}</div>
                  </td>
                  <td>
                    <IconButton
                      disabled={isSubmitting}
                      onClick={() => removeAttribute(index)}
                      image="icons/delete-primary.svg"
                    />
                  </td>
                </tr>
              ))}

              <tr>
                <td>
                  <input
                    className={styles.input}
                    value={newAttributeKey}
                    onChange={e => setNewAttributeKey(e.target.value)}
                    type="text"
                    name="attribute key"
                    placeholder="Attribute key"
                  />
                </td>
                <td>
                  <input
                    className={styles.input}
                    value={newAttributeValue}
                    onChange={e => setNewAttributeValue(e.target.value)}
                    type="text"
                    name="attribute key"
                    placeholder="Attribute value"
                  />
                </td>
                <td>
                  <IconButton
                    disabled={isSubmitting}
                    onClick={addAttribute}
                    image="icons/add-primary.svg"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Capabilities</label>
          <table cellPadding={15} cellSpacing={0} className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Target</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {form.capabilities.map((capability, index) => (
                <tr key={index}>
                  <td valign="middle">
                    <div title={capability.name}>{capability.name}</div>
                  </td>
                  <td valign="middle">
                    <div title={capability.target}>{capability.target}</div>
                  </td>
                  <td valign="middle">
                    <IconButton
                      disabled={isSubmitting}
                      onClick={() => removeCapability(index)}
                      image="icons/delete-primary.svg"
                    />
                  </td>
                </tr>
              ))}

              <tr>
                <td valign="middle">
                  <input
                    className={styles.input}
                    value={newCapabilityName}
                    onChange={e => setNewCapabilityName(e.target.value)}
                    type="text"
                    name="capability name"
                    placeholder="Capability name"
                  />
                </td>
                <td valign="middle">
                  <input
                    className={styles.input}
                    value={newCapabilityTarget}
                    onChange={e => setNewCapabilityTarget(e.target.value)}
                    type="text"
                    name="capability target"
                    placeholder="Capability target"
                  />
                </td>
                <td valign="middle">
                  <IconButton
                    disabled={isSubmitting}
                    onClick={addCapability}
                    image="icons/add-primary.svg"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </ContentBox>
  );
};
