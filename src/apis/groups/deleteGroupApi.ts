import axios from 'axios';

export interface IDeleteGroupApi {
  (uid: string): Promise<IDeleteGroupApiResponse>;
}

export interface IDeleteGroupApiResponse {
  success: boolean;
  data: IDeleteGroupApiResponseData;
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IDeleteGroupApiResponseData {}

export const deleteGroupApi: IDeleteGroupApi = async (gid) => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'DELETE',
    url: `${process.env.AUTH_API_URL}/api/groups/${gid}`
  });
  return response.data;
};
