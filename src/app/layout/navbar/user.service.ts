import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { baseUrl } from '../../baseConfig';

@Injectable({ providedIn: 'root' })
export class UserService {
  private redirectUrl: string | null = null;
  __httpClient = inject(HttpClient);

  private isAdmin = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdmin.asObservable(); // Observable for template

  private userModel = new BehaviorSubject<object>({});
  userModel$ = this.userModel.asObservable(); // Observable for template

  private userImageSubject = new BehaviorSubject<string>('');
  userImage$ = this.userImageSubject.asObservable(); // Observable for template

    private getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  setAdmin(isAdmin: boolean): void {
    this.isAdmin.next(isAdmin);
  }

  setUserModel(user: any): void {
    this.userModel.next(user);
  }

  getProfile() {
    return this.__httpClient.get(
      `${baseUrl}user/profile`,  // Will proxy to http://localhost:3000/recipe
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

  getAnalytic(period: string, mode: string): Observable<any> {
    return this.__httpClient.get(`${baseUrl}admin/analytics?metric=${mode}&period=${period}`, {
          headers: this.getHeaders(),
        })
  }

  // getProfileImage() {
  //   return this.__httpClient.get(
  //     `${baseUrl}profile-image/${imageId}`
  //   )
  // }
}