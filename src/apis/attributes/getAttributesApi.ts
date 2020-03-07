import axios from 'axios';

export interface IGetAttributesApi {
  (owner: string): Promise<IGetAttributesApiResponse>;
}

export interface IGetAttributesApiResponse {
  success: boolean;
  data: IGetAttributesApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IGetAttributesApiResponseData {
  owner: string;
  attributes: {
    data: {
      [key: string]: string[];
    };
  };
}

export const getAttributesApi: IGetAttributesApi = async owner => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    params: {
      owner
    },
    url: `${process.env.AUTH_API_URL}/api/attributes`
  });
  return response.data;
};
