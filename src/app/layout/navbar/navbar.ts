import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { UserService } from './user.service';
import { BehaviorSubject, filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnInit {
navOpen = false;
authService = inject(AuthService)
private _router = inject(Router);
private userService= inject(UserService)
private cdr = inject(ChangeDetectorRef)
userData$ = new BehaviorSubject<any>(null); // start with null or {}

private profileSubject = new BehaviorSubject<any>({});
private routerSub!: Subscription;
profile$ = this.profileSubject.asObservable(); // Observable for template
userImage: any;
userName!: string;
showCreateRecipie: boolean = false;

ngOnInit(): void {
      this.userService.getProfile().subscribe((response: any) => {
      this.profileSubject.next(response || []);
      this.userData$.next(response); // push new value
      this.userName = response.user.name;
      this.userService.setUserModel(response.user);
      if(response.user.role === 'admin') {
        this.userService.setAdmin(true);
      } else this.userService.setAdmin(false);

  this.routerSub = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (
          this._router.url.includes('admin-panel') ||
          this._router.url === '/recepie/recepie-create'
        ) {
          this.showCreateRecipie = false;
        } else {
          this.showCreateRecipie = true;
        }
      });    
      

      if(response?.profile_image)
        this.renderImage(response.profile_image.id);
      
    })
}

toggleNav() {
  this.navOpen = !this.navOpen;
}

onActivate(event: any) {
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
}

logout() {
  localStorage.clear();
  this.authService.logout();
}

goProfilePage() {
  this._router.navigateByUrl('profile')
}

  renderImage(imageId: string) {    
    this.userService.getProfileImage(imageId).subscribe((response: any) => {
      this.userImage = response;
      this.cdr.detectChanges()
      // this.imageExist = true;
      // this.imageId = imageId;
      // this.cdr.detectChanges();
      
    })
  }

}
