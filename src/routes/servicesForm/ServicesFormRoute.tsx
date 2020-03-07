import { Redirect } from '@reach/router';
import * as React from 'react';
import { FormEvent, useContext, useEffect, useState } from 'react';

import {
  IGetServicesApiResponseData,
  getAttributesApi,
  getServicesApi,
  createServiceApi,
  editServiceApi,
  setAttributesApi
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

import styles from './ServicesFormRoute.scss';

interface IProps {
  path: string;
  serviceName: string;
  uri: string;
}

export const ServicesFormRoute: React.FunctionComponent<IProps> = (props) => {

  const [isLoading, setIsLoading] = useState(true);
  const [serviceList, setServiceList] = useState<IGetServicesApiResponseData[]>([]);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const initialFormState: {
    name: string;
    type: string;
    description: string;
    enabled: string;
    url: string;
    password: string;
    attributes: {
      key: string;
      value: string;
    }[];
  } = {
    name: '',
    type: 'spa',
    description: '',
    enabled: 'true',
    url: '',
    password: '',
    attributes: []
  };
  const [form, setFormValues] = useState(initialFormState);

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

  const loadServices = async () => {
    setIsLoading(true);
    const services = await getServicesApi();
    setIsLoading(false);

    setServiceList(services.data);

    if (props.serviceName) {
      const serviceToEdit = services.data.find(
        service => service.name === props.serviceName
      );

      const { data: attributesData } = await getAttributesApi(props.serviceName);

      const attributes = [];
      Object.entries(attributesData[0].attributes.data).forEach(
        ([key, values]) => {
          attributes.push({
            key,
            value: values[0]
          });
        }
      );

      setFormValues({
        name: serviceToEdit.name || '',
        type: serviceToEdit.type || '',
        description: serviceToEdit.description || '',
        enabled: String(serviceToEdit.enabled),
        url: serviceToEdit.url || '',
        password: serviceToEdit.password || '',
        attributes
      });
    }
  };

  useEffect(() => {
    setPage('services');
    if (props.path.includes('new')) {
      setBreadcrumbs([
        { text: 'Services', url: 'services' },
        { text: 'New Service', url: 'services/new' }
      ]);
    } else if (props.path.includes('edit')) {
      setBreadcrumbs([
        { text: 'Services', url: 'services' },
        { text: 'Edit Service', url: props.uri.substr(1) }
      ]);
    } else {
      setBreadcrumbs([{ text: 'Services', url: 'services' }]);
    }
    loadServices();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (props.path.includes('new')) {
      if (form.name == '') {
        setErrorMessage('Must select name');
        setIsSubmitting(false);
        return;
      }

      try {
        await createServiceApi({
          name: form.name,
          type: form.type,
          description: form.description,
          enabled: form.enabled === 'true',
          url: form.url,
          password: form.password
        });
        const attributes: {
          [key: string]: string[];
        } = {};
        form.attributes.forEach(attribute => {
          attributes[attribute.key] = [attribute.value];
        });
        await setAttributesApi({
          owner: form.name,
          attributes
        });
        setFormValues(initialFormState);
        loadServices();
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
        await editServiceApi({
          name: form.name,
          type: form.type,
          description: form.description,
          enabled: form.enabled === 'true',
          url: form.url,
          password: form.password
        });
        const attributes: {
          [key: string]: string[];
        } = {};
        form.attributes.forEach(attribute => {
          attributes[attribute.key] = [attribute.value];
        });
        await setAttributesApi({
          owner: form.name,
          attributes
        });
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
    return <Redirect to={`${process.env.PUBLIC_URL}services`} />;
  }

  return (
    <ContentBox>
      <form onSubmit={handleSubmit}>
        <PageHeader
          header={props.path.includes('new') ? 'New Service' : 'Edit Service'}
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
            label="Name"
            name="name"
            disabled={props.path.includes('edit')}
            placeholder="Enter a new name"
            onChange={event => updateForm(event)}
            value={form.name}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="type">
            Type
          </label>
          <select
            className={styles.input}
            value={form.type}
            onChange={updateForm}
            name="type"
          >
            <option value="spa">Single Page Application</option>
            <option value="api">Web Service API</option>
            <option value="webapp">Web Application</option>
            <option value="mobile">Mobile Application</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="enabled">
            Enabled
          </label>
          <select
            className={styles.input}
            value={form.enabled}
            onChange={updateForm}
            name="enabled"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className={styles.field}>
          <TextField
            label="Description"
            name="description"
            placeholder="Enter a new description"
            onChange={event => updateForm(event)}
            value={form.description}
          />
        </div>

        <div className={styles.field}>
          <TextField
            label="URL"
            name="url"
            placeholder="Enter a new URL"
            onChange={event => updateForm(event)}
            value={form.url}
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
      </form>
    </ContentBox>
  );
};
