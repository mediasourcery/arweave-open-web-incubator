import axios from 'axios';

export interface IGetFileApi {
  (request: IGetFileApiRequest): Promise<IGetFileApiResponse>;
}

export interface IGetFileApiRequest {
  sharedToken?: string;
}

export interface IGetFileApiResponse {
  success: boolean;
  data: IGetFileApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IGetFileApiResponseData {
  sharedToken?: string;
}

export const deleteSharedApi: IGetFileApi = async (request) => {

  const response = await axios({
    // headers: {
    //   Authorization: `Bearer ${sessionStorage.getItem('token')}`
    // },
    method: 'GET',
    url: `${process.env.DOC_API_URL_V2}/shared-tokens/${request}/${sessionStorage.getItem('token')}`
  });
  return response.data;
};
