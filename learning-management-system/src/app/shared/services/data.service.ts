import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataEncryptionService } from './data-encryption.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  ADMIN_ROLES = ['BA', 'SuperManager'];
  apiUrl = 'http://localhost:3005';
  constructor(private http: HttpClient, private encryptionService: DataEncryptionService) { }

  processGetRequest(resource: any, queryParameters?: any, isEncryptionRequired = true) {
    const headers = this.getHeaders();

    if (isEncryptionRequired) {
      resource = this.encryptionService.encryptGetRequest(resource, queryParameters);
    }

    return this.http.get(`${this.apiUrl}/${resource}`, { headers });
  }

  processPostRequest(resource: any, body: any, isEncryptionRequired = true) {
    const headers = this.getHeaders();

    if (isEncryptionRequired) {
      body = this.encryptionService.encryptPostRequest(body);
    }
    return this.http.post(`${this.apiUrl}/${resource}`, body, { headers });
  }

  processDeleteRequest(resource: any, body: any) {
    return this.http.post(`${this.apiUrl}/${resource}`, body);
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
    });
  }
}
