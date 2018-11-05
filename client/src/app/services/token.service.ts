import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private cookieService: CookieService) { }

  SetToken(token) {
    this.cookieService.set('chat_token', token);
  }

  GetToken() {
    return this.cookieService.get('chat_token');
  }

  DeleteToken() {
    this.cookieService.delete('chat_token');
  }

  GetPayload() {
    const token = this.GetToken();
    let payload;

    if(token) {
      // Token created by jwt has format like 'header.payload.signature'. To get payload we split token by dot and element with index 1.
      payload = token.split('.')[1];
      // The atob() method decodes a base-64 encoded string.
      payload = JSON.parse(window.atob(payload));
    }

    return payload.data;
  }
}
