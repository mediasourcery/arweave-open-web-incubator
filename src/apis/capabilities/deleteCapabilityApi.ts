import axios from 'axios';

export interface IDeleteCapabilityApi {
  (request: IDeleteCapabilityApiRequest): Promise<IDeleteCapabilityApiResponse>;
}

export interface IDeleteCapabilityApiRequest {
  owner: string;
  name: string;
  target: string;
}

export interface IDeleteCapabilityApiResponse {
  success: boolean;
  data: IDeleteCapabilityApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IDeleteCapabilityApiResponseData {
  email: string;
  uid: string;
  status: string;
  groups: string;
}

export const deleteCapabilityApi: IDeleteCapabilityApi = async (request) => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'DELETE',
    params: {
      owner: request.owner,
      name: request.name,
      target: request.target
    },
    url: `${process.env.AUTH_API_URL}/api/capabilities`
  });
  return response.data;
};
