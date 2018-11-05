import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  registerUser(body): Observable<any> {
    return this.http.post(`/api/chatapp/register`, body);
  }

  loginUser(body): Observable<any> {
    return this.http.post(`/api/chatapp/login`, body);
  }
}
