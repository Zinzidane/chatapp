import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Write headers configaration
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    // Get token from the token service
    const token = this.tokenService.GetToken();
    // If token exists then add it to Authorization header
    if(token) {
      headersConfig['Authorization'] = `bearer ${token}`;
    }

    // Clone original request and add to set to headers headerConfig
    const _req = req.clone({setHeaders: headersConfig});
    return next.handle(_req);
  }
}
