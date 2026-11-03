import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';
import { BehaviorSubject } from 'rxjs';
import { RatingModule } from 'primeng/rating';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseUrl } from '../baseConfig';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UserService } from '../layout/navbar/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
   imports: [
    CommonModule,
    FormsModule,
    RatingModule,
    MatIconModule
    ,MatCardModule,
    MatFormFieldModule
    // You can also add other standalone components, directives, or pipes here
  ],
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {

  // Profile data
  userName!: string;
  userEmail!: string;
  userDescription: string = 'Recipe Enthusiast';
  profileImageSrc!: string | ArrayBuffer;
  imageExist: boolean = false;
  imageId!: string;
  profileService = inject(ProfileService);
  private http = inject(HttpClient);
  private _snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(Router);
  public userService = inject(UserService);
  isReset$ = new BehaviorSubject<boolean>(false);
  highRateScore: number = 0;
  highLikes: number = 0;
  imageExistId!: number;
  stats!: any;

  private favoriteSubject = new BehaviorSubject<any[]>([]);
  favorite$ = this.favoriteSubject.asObservable(); // Observable for template
  
  private ratingSubject = new BehaviorSubject<any[]>([]);
  rating$ = this.ratingSubject.asObservable(); // Observable for template

  private profileSubject = new BehaviorSubject<any>({});
  profile$ = this.profileSubject.asObservable(); // Observable for template

  userData$ = new BehaviorSubject<any>(null); // start with null or {}

  selectedFile?: File;
  formData = new FormData();

  resetToken!: string;
  // Password form data
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  // Recipe data (this would likely come from an API call)
  favoriteRecipes = [
    {
      name: 'Spicy Chicken Stir-fry',
      rating: '★★★★★',
      description: 'A quick and delicious stir-fry perfect for a weeknight meal.',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      name: 'Classic Margherita Pizza',
      rating: '★★★★☆',
      description: 'Simple yet flavorful, a timeless classic.',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      name: 'Homemade Apple Pie',
      rating: '★★★★★',
      description: 'The best comfort food with a flaky crust and sweet filling.',
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  ngOnInit(): void {
    this.profileService.getFavourite(0, {}).subscribe((response: any) => {
      this.favoriteSubject.next(response.data || []);
      
    })

    this.profileService.getRating(0, {}).subscribe((response: any) => {
      this.ratingSubject.next(response.data || []);
      
    })

    this.profileService.getProfile().subscribe((response: any) => {
      this.profileSubject.next(response || []);
      this.userData$.next(response); // push new value

      if(response?.profile_image)
      this.renderImage(response.profile_image.id);
      this.stats = response.stats;
      
      this.userName = response.user.name;
      this.userEmail = response.user.email;

      this.highRateScore = response?.highest_rated_recipe.score;
      this.highLikes = response?.most_popular_recipe.count;;
      
    })
  }

  openRecipe(recipeId: number): void {
    this.route.navigateByUrl(`recepie/recepie-detail/` + recipeId)
  }  

  clickTag(event: Event, tag: any): void {
    this.route.navigateByUrl(`recepie/recepie-list?tag=${tag.ID}`)
    event.stopPropagation(); // Prevent the click from propagating to parent elements
  }
  
  clickCategory(event: Event, category: any): void {
    this.route.navigateByUrl(`recepie/recepie-list?category=${category.ID}`)
    event.stopPropagation(); // Prevent the click from propagating to parent elements
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      const imageBase64 = reader.result as string;
      this.profileImageSrc = reader.result as ArrayBuffer; // this will update <img [src]>
      this.cdr.detectChanges()
      this.uploadImage(); // pass to upload
    };

    reader.readAsDataURL(this.selectedFile);
  }
}

  openResetField() {
        this.userData$.subscribe(element => {
      
        this.profileService.forgotPassword(element.user.email).subscribe((response: any) => {
          this.resetToken = response.reset_token;
          this.isReset$.next(true);
        })
    })
  }

  // Handle password reset logic
  resetPassword(): void {
    // Implement your password reset logic here
    // You'll need to validate the passwords and call your backend service
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    // Call your backend service (e.g., via an HttpClient)
    // this.authService.resetPassword(this.passwordData).subscribe(...)
    this.profileService.resetPassword(this.passwordData.confirmPassword, this.resetToken).subscribe(response => {      
      alert('Password reset attempt. Check console for data.');
    })
  }

  private getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  renderImage(imageId: string) {    
    this.profileService.getProfileImage(imageId).subscribe((response: any) => {
      this.profileImageSrc = response;
      this.imageExist = true;
      this.imageId = imageId;
      this.cdr.detectChanges();
      
    })
  }

 uploadImage(): void {

  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('image', this.selectedFile, this.selectedFile.name);

  if (this.imageExist) {
    this.http.delete(`${baseUrl}user/profile-image/${this.imageId}`, {
      headers: this.getHeaders().delete('Content-Type')
    }).subscribe({
      next: () => {
        this.http.post(`${baseUrl}user/profile-image`, formData, {
          headers: this.getHeaders().delete('Content-Type')
        }).subscribe({
          next: () => {
            this._snackBar.open('تصویر با موفقیت آپلود شد', 'موفق', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          },
          error: (err) => {
            console.error('خطا در آپلود تصویر:', err);
            this._snackBar.open('خطا در آپلود تصویر', 'خطا', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          },
        });
      },
      error: (err) => {
        console.error('خطا در حذف تصویر قبلی:', err);
        this._snackBar.open('خطا در حذف تصویر قبلی', 'خطا', {
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  } else {
    this.http.post(`${baseUrl}user/profile-image`, formData, {
      headers: this.getHeaders().delete('Content-Type')
    }).subscribe({
      next: () => {
        console.log('آپلود تصویر موفق بود');
        this._snackBar.open('تصویر با موفقیت آپلود شد', 'موفق', {
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('خطا در آپلود تصویر:', err);
        this._snackBar.open('خطا در آپلود تصویر', 'خطا', {
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  // }

}

 }

 openAdminPanel(): void {
  this.route.navigate(['admin-panel'])
 }
}