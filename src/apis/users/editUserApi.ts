import axios from 'axios';

export interface IEditUserApi {
  (request: IEditUserApiRequest): Promise<IEditUserApiResponse>;
}

export interface IEditUserApiRequest {
  email: string;
  uid: string;
  status: string;
}

export interface IEditUserApiResponse {
  success: boolean;
  data: IEditUserApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IEditUserApiResponseData {
  email: string;
  uid: string;
  status: string;
}

export const editUserApi: IEditUserApi = async request => {
  const data: {
    group: string;
    email?: string;
    uid?: string;
    status?: string;
  } = {
    group: '/'
  };
  if (request.email) {
    data.email = request.email;
  }
  if (request.uid) {
    data.uid = request.uid;
  }
  if (request.status) {
    data.status = request.status;
  }
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'PUT',
    data,
    url: `${process.env.AUTH_API_URL}/api/users`
  });
  return response.data;
};
