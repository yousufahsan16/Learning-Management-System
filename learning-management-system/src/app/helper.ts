import { HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

export const encryptPostRequest = (payload: any) => {
  const secretKey = localStorage.getItem('sessionToken') || ''; //User JWT will be used as a secret key
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), secretKey).toString();

  return {
    payload: encryptedPayload
  };
}

export const encryptGetRequest = (apiUrl: string, queryParams: any) => {
  const secretKey = localStorage.getItem('sessionToken') || ''; //User JWT will be used as a secret key
  const encryptedQueryParams = CryptoJS.AES.encrypt(JSON.stringify(queryParams), secretKey).toString();

  return `${apiUrl}?data=${encodeURIComponent(encryptedQueryParams)}`;
}

export const getHeaders = () => {
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
  });
}