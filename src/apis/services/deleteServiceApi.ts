import axios from 'axios';

export interface IDeleteServiceApi {
  (name: string): Promise<IDeleteServiceApiResponse>;
}

export interface IDeleteServiceApiResponse {
  success: boolean;
  data: IDeleteServiceApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IDeleteServiceApiResponseData {
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export const deleteServiceApi: IDeleteServiceApi = async (name) => {
  console.log(JSON.stringify(process.env.AUTH_UI_GATEWAY_URL));
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'DELETE',
    url: `${process.env.AUTH_API_URL}/api/services/${name}`
  });
  return response.data;
};
