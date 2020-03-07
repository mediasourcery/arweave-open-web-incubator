import axios from 'axios';

export interface ISetPasswordApi {
  (request: ISetPasswordApiRequest): Promise<ISetPasswordApiResponse>;
}

export interface ISetPasswordApiRequest {
  email?: string;
  password: string;
  uid?: string;
}

export interface ISetPasswordApiResponse {
  success: boolean;
  data: ISetPasswordApiResponseData;
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ISetPasswordApiResponseData {}

export const setPasswordApi: ISetPasswordApi = async request => {
  const params: {
    email?: string;
    password: string;
    uid?: string;
  } = {
    password: request.password
  };
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
    params,
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/changepass`
  });
  return response.data;
};
