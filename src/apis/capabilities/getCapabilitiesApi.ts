import axios from 'axios';

export interface IGetCapabilitiesApi {
  (owner: string): Promise<IGetCapabilitiesApiResponse>;
}

export interface IGetCapabilitiesApiResponse {
  success: boolean;
  data: IGetCapabilitiesApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IGetCapabilitiesApiResponseData {
  owner: string;
  capability: {
    name: string;
    target: string;
  };
}

export const getCapabilitiesApi: IGetCapabilitiesApi = async owner => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    params: {
      owner
    },
    url: `${process.env.AUTH_API_URL}/api/capabilities`
  });
  return response.data;
};
