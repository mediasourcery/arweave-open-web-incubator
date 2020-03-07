import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { navigate } from '@reach/router';

import {
  IGetServicesApiResponseData,
  getServicesApi,
  deleteServiceApi
} from '../../apis';

import {
  Loader,
  Button,
  ContentBox,
  PageHeader,
  ButtonLink,
  IconButton,
  Icon,
	TextField,
	FileUploader
} from '../../components';

import { PageContext, BreadcrumbsContext } from '../../contexts';

import styles from './ServicesRoute.scss';

export const ServicesRoute: React.FunctionComponent = () => {
  const { setPage } = useContext(PageContext);
  const { setBreadcrumbs } = useContext(BreadcrumbsContext);

  const [isLoading, setIsLoading] = useState(true);
  const [serviceList, setServiceList] = useState<IGetServicesApiResponseData[]>(
    []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadServices = async () => {
    try {
      const services = await getServicesApi();

      setServiceList(
        services.data.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
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
    setPage('services');
    setBreadcrumbs([{ text: 'Services', url: 'services' }])
    loadServices();
  }, []);

  const deleteService = async index => {
    const serviceToDelete = serviceList[index];
    if (
      !confirm(
        `Are you sure you want to delete this service?\nName: ${serviceToDelete.name}`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteServiceApi(serviceToDelete.name);
      loadServices();
    } catch (error) {
      setErrorMessage(error.message);
    }

    setIsSubmitting(false);
  };

  const editService = async index => {
    navigate(`${process.env.PUBLIC_URL}services/${serviceList[index].name}/edit`);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
		<FileUploader />
  );
};
