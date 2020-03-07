import axios from 'axios';

export interface ISetAttributesApi {
  (request: ISetAttributesApiRequest): Promise<ISetAttributesApiResponse>;
}

export interface ISetAttributesApiRequest {
  owner: string;
  attributes: {
    [key: string]: string[];
  };
}

export interface ISetAttributesApiResponse {
  success: boolean;
  data: ISetAttributesApiResponseData;
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ISetAttributesApiResponseData {}

export const setAttributesApi: ISetAttributesApi = async request => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    data: request,
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/attributes`
  });
  return response.data;
};
