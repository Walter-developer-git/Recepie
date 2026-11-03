import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../baseConfig';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
  private redirectUrl: string | null = null;
  __httpClient = inject(HttpClient);

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token; // true if token exists
  }

  login(loginModel: {email: string, password: string}) {
    this.loggedIn = true;
    return this.__httpClient.post(baseUrl + 'login', loginModel)
  }

  register(registerModel: {email: string, password: string, name: string, last_name: string, salt?: string,}) {
    return this.__httpClient.post(baseUrl + 'signup', registerModel)
  }

  logout(): void {
    this.loggedIn = false;
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }
}