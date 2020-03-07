import axios from 'axios';

export interface ICreateUserApi {
  (request: ICreateUserApiRequest): Promise<ICreateUserApiResponse>;
}

export interface ICreateUserApiRequest {
  email: string;
  password: string;
  uid: string;
  status: string;
}

export interface ICreateUserApiResponse {
  success: boolean;
  data: ICreateUserApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ICreateUserApiResponseData {
  email: string;
  uid: string;
  status: string;
}

export const createUserApi: ICreateUserApi = async (request) => {
  const params: {
    email?: string;
    uid?: string;
    password?: string;
  } = {};
  if (request.email) {
    params.email = request.email;
  }
  if (request.uid) {
    params.uid = request.uid;
  }
  if (request.password) {
    params.password = request.password;
  }
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    data: {
      status: request.status
    },
    params,
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/users`
  });
  return response.data;
};
