import axios from 'axios';

export interface ICreateCapabilityApi {
  (request: ICreateCapabilityApiRequest): Promise<ICreateCapabilityApiResponse>;
}

export interface ICreateCapabilityApiRequest {
  owner: string;
  name: string;
  target: string;
}

export interface ICreateCapabilityApiResponse {
  success: boolean;
  data: ICreateCapabilityApiResponseData;
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ICreateCapabilityApiResponseData {
  owner: string;
  capability: {
    name: string;
    target: string;
  };
}

export const createCapabilityApi: ICreateCapabilityApi = async request => {
  const params: {
    owner?: string;
    name?: string;
    target?: string;
  } = {};
  if (request.name) {
    params.name = request.name;
  }
  if (request.owner) {
    params.owner = request.owner;
  }
  if (request.target) {
    params.target = request.target;
  }
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    params,
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/capabilities`
  });
  return response.data;
};
