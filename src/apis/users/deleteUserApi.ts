import axios from 'axios';

export interface IDeleteUserApi {
  (request: IDeleteUserApiRequest): Promise<IDeleteUserApiResponse>;
}

export interface IDeleteUserApiRequest {
  email?: string;
  uid?: string;
}

export interface IDeleteUserApiResponse {
  success: boolean;
  data: IDeleteUserApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IDeleteUserApiResponseData {
  email: string;
  uid: string;
  status: string;
  groups: string;
}

export const deleteUserApi: IDeleteUserApi = async (request) => {
  const params: {
    email?: string;
    uid?: string;
  } = {};
  if (request.email) {
    params.email = request.email;
  }
  if (request.uid) {
    params.uid = request.uid;
  }
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'DELETE',
    params,
    url: `${process.env.AUTH_API_URL}/api/users`
  });
  return response.data;
};
