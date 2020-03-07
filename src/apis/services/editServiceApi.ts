import axios from 'axios';

export interface IEditServiceApi {
  (request: IEditServiceApiRequest): Promise<IEditServiceApiResponse>;
}

export interface IEditServiceApiRequest {
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export interface IEditServiceApiResponse {
  success: boolean;
  data: IEditServiceApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IEditServiceApiResponseData {
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export const editServiceApi: IEditServiceApi = async request => {
  const data: {
    type?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
    url?: string;
    password?: string;
  } = {
    enabled: request.enabled
  };
  if (request.type) {
    data.type = request.type;
  }
  if (request.name) {
    data.name = request.name;
  }
  if (request.description) {
    data.description = request.description;
  }
  if (request.url) {
    data.url = request.url;
  }
  if (request.password) {
    data.password = request.password;
  }
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'PUT',
    data,
    url: `${process.env.AUTH_API_URL}/api/services/${request.name}`
  });
  return response.data;
};
