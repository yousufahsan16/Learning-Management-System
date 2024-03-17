import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class DataEncryptionService {

  constructor() { }
  
  encryptPostRequest(payload: any): any {
    const secretKey = localStorage.getItem('sessionToken') || ''; //User JWT will be used as a secret key
    const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), secretKey).toString();

    return {
      payload: encryptedPayload
    };
  }

  encryptGetRequest(apiUrl: string, queryParams: any): string {
    const secretKey = localStorage.getItem('sessionToken') || ''; //User JWT will be used as a secret key
    const encryptedQueryParams = CryptoJS.AES.encrypt(JSON.stringify(queryParams), secretKey).toString();

    return `${apiUrl}?data=${encodeURIComponent(encryptedQueryParams)}`;
  }
}