import axios from 'axios';
import { IFileType } from '../../routes/documents/DocumentsRoute';

export interface IShareFileApi {
  (request: IShareFileApiRequest): Promise<IShareFileApiResponse>;
}

export interface IShareFileApiRequest {
  type?: string;
  name?: string;
  file?: IFileType;
  method?: string;
  enabled?: boolean;
  email?: string;
  phone?: string;
  ownerEmail?: string;
}

export interface IShareFileApiResponse {
  success: boolean;
  data: IShareFileApiResponseData[];
  errors: {
    code: string;
    category: string;
    message: string;
    data: any[];
  }[];
}

export interface IShareFileApiResponseData {
  type?: string;
  name?: string;
  file?: IFileType;
  method?: string;
  enabled?: boolean;
  email?: string;
  phone?: string;
  ownerEmail?: string;
}

export const shareFileApi: IShareFileApi = async (request) => {
  const data: {
    name?: string;
    file?: IFileType;
    fileName?: string;
    fileUrl?: string;
    method?: string;
    enabled?: boolean;
    email?: string;
    phone?: string;
    ownerEmail?: string;
    server?: string;
  } = {
    enabled: request.enabled
  };
  const file = request.file;

  if (file.fileName && file.server !== 'Internal Server') {
    data.fileUrl = file.fileUrl;
  }

  data.fileName = file.fileName;

  if (request.method) {
    data.method = request.method;
    if (request.method === 'phone') {
      data.phone = request.email;
    } else {
      data.email = request.email;
    }
  }

  if (file.server && file.server !== 'Internal Server') {
    data.server = request.file.server;
  }

  if (request.name) {
    data.name = request.name;
  }

  if (request.ownerEmail) {
    data.ownerEmail = request.ownerEmail;
  }

  const response = await axios({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    data,
    method: 'POST',
    url: `${process.env.DOC_API_URL_V2}/share-tokens`
  });
  return response.data;
};
