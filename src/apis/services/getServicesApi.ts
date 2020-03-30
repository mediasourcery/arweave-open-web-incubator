import axios from 'axios';

export interface IGetServicesApi {
  (): Promise<IGetServicesApiResponse>;
}

export interface IGetServicesApiResponse {
  success: boolean;
  data: IGetServicesApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IGetServicesApiResponseData {
  type: 'api' | 'mobile' | 'spa' | 'webapp';
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export const getServicesApi: IGetServicesApi = async () => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    url: `${process.env.AUTH_API_URL}/api/services`
  });
  return response.data;
};
