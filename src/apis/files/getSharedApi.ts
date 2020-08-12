import axios from 'axios';
import { IFileType } from '../../routes/documents/DocumentsRoute';

export interface IUserOwner {
  filename: string,
  recorded: string,
  token: string,
  documentowner: string,
  email: string,
  phone: string,
  method: string,
}

export interface IGetSharedApi {
  (file: IFileType): Promise<IGetSharedApiResponse>;
}

export interface IGetViewedApi {
  (file: string): Promise<IGetSharedApiResponse>;
}

export interface IGetSharedApiResponse {
  success: boolean;
  data: string[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export const getViewedApi: IGetViewedApi = async (fileName: string) => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    url: `${process.env.DOC_API_URL_V2}/shared-tokens/${fileName}`
  });
  return response.data;
};


export const getSharedApi: IGetSharedApi = async (file: IFileType) => {
  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
    url: `${process.env.DOC_API_URL_V2}/shared-tokens/${file.fileName}`
  });
  return response.data;
};
