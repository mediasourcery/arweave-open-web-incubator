import axios from 'axios';

export interface IGetUsersApi {
  (): Promise<IGetUsersApiResponse>;
}

export interface IGetUsersApiResponse {
  success: boolean;
  data: IGetUsersApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IGetUsersApiResponseData {
  email: string;
  uid: string;
  status: string;
  groups: string;
}

export const getUsersApi: IGetUsersApi = async () => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    url: `${process.env.AUTH_API_URL}/api/users`
  });
  return response.data;
};
