import axios from 'axios';

export interface ICreateServiceApi {
  (request: ICreateServiceApiRequest): Promise<ICreateServiceApiResponse>;
}

export interface ICreateServiceApiRequest {
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export interface ICreateServiceApiResponse {
  success: boolean;
  data: ICreateServiceApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ICreateServiceApiResponseData {
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  url: string;
  password?: string;
}

export const createServiceApi: ICreateServiceApi = async (request) => {
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
    data,
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/services`
  });
  return response.data;
};
