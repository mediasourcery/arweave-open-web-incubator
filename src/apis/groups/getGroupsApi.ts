import axios from 'axios';

export interface IGetGroupsApi {
  (): Promise<IGetGroupsApiResponse>;
}

export interface IGetGroupsApiResponse {
  success: boolean;
  data: string[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export const getGroupsApi: IGetGroupsApi = async () => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    url: `${process.env.AUTH_API_URL}/api/groups?recursive=true`
  });
  return response.data;
};
