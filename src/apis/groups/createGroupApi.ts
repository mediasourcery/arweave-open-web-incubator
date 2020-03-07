import axios from 'axios';

export interface ICreateGroupApi {
  (request: ICreateGroupApiRequest): Promise<ICreateGroupApiResponse>;
}

export interface ICreateGroupApiRequest {
  gid: string;
  parentGid: string;
}

export interface ICreateGroupApiResponse {
  success: boolean;
  data: ICreateGroupApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface ICreateGroupApiResponseData {}

export const createGroupApi: ICreateGroupApi = async (request) => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'POST',
    url: `${process.env.AUTH_API_URL}/api/groups${request.parentGid}/${request.gid}`
  });
  return response.data;
};
