import axios from 'axios';

export interface IDeleteSharedApi {
  (request: IDeleteSharedApiRequest): Promise<IDeleteSharedApiResponse>;
}

export interface IDeleteSharedApiRequest {
  sharedToken?: string;
}

export interface IDeleteSharedApiResponse {
  success: boolean;
  data: IDeleteSharedApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IDeleteSharedApiResponseData {
  sharedToken?: string;
}

export const deleteSharedApi: IDeleteSharedApi = async (request) => {

  const response = await axios({
    // headers: {
    //   Authorization: `Bearer ${sessionStorage.getItem('token')}`
    // },
    method: 'DELETE',
    url: `${process.env.DOC_API_URL_V2}/shared-tokens/${request}/${sessionStorage.getItem('token')}`
  });
  return response.data;
};
