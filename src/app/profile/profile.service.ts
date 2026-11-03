import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../baseConfig';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private redirectUrl: string | null = null;
  
  __httpClient = inject(HttpClient);

    private getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  resetPassword(password: string,token: string) {
    return this.__httpClient.post(baseUrl + 'reset-password',
        {new_password: password,token: token},
        { headers: this.getHeaders() }
    )
  }

  forgotPassword(email: string) {    
    return this.__httpClient.post(baseUrl + 'forgot-password',
        {email},
        { headers: this.getHeaders() }
    )
  }

  getFavourite(pageIndex: number = 0, model: any) {
    return this.__httpClient.get(
      `${baseUrl}user/favorites?offset=${pageIndex}&limit=10`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders(), params: model }
    );
  }  

  getRating(pageIndex: number = 0, model: any) {
    return this.__httpClient.get(
      `${baseUrl}user/ratings?offset=${pageIndex}&limit=10`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders(), params: model }
    );
  }

  getRecipie(pageIndex: number = 0, model: any) {
    return this.__httpClient.get(
      `${baseUrl}user/recipes?offset=${pageIndex}&limit=10`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders(), params: model }
    );
  }

  getProfile() {
    return this.__httpClient.get(
      `${baseUrl}user/profile`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders() }
    );
  }

  getAllUsers(pageIndex: number = 0, model: any = {}) {
    return this.__httpClient.get(
      `${baseUrl}admin/users?offset=${pageIndex}&limit=20`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders() }
    );
  }

  // getProfileImage(imageId: string) {
  //   return this.__httpClient.get(
  //     `${baseUrl}user/profile-image/${imageId}`,  // Will proxy to http://localhost:3000/recipe
  //     { headers: this.getHeaders() }
  //   );
  // }

    getProfileImage(imageId: string): Observable<string> {
      return this.__httpClient
        .get(`${baseUrl}user/profile-image/${imageId}`, {
          responseType: 'blob', // get binary data
          headers: this.getHeaders()
        })
        .pipe(
          map((blob) => URL.createObjectURL(blob)) // convert blob to object URL
        );
    }

  // getProfileImage() {
  //   return this.__httpClient.get(
  //     `${baseUrl}profile-image/${imageId}`
  //   )
  // }
}