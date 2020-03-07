import axios from 'axios';

export interface IEditCapabilityApi {
  (request: IEditCapabilityApiRequest): Promise<IEditCapabilityApiResponse>;
}

export interface IEditCapabilityApiRequest {
  email: string;
  password: string;
  uid: string;
  status: string;
  groups: string;
}

export interface IEditCapabilityApiResponse {
  success: boolean;
  data: IEditCapabilityApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IEditCapabilityApiResponseData {
  email: string;
  uid: string;
  status: string;
  groups: string;
}

export const editCapabilityApi: IEditCapabilityApi = async request => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'PUT',
    data: request,
    url: `${process.env.AUTH_API_URL}/api/capabilities?uid=${request.uid}`
  });
  return response.data;
};
