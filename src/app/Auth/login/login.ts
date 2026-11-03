import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

// ✅ PrimeNG Toast
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  providers: [AuthService, MessageService], // ✅ add MessageService
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, ToastModule],
})
export class Login {
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  _authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService); // ✅ inject Toast
  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    localStorage.clear();
  }

  constructor() {}

  loading = {
    isLoading: () => false,
  };

  login(): void {
    this._authService.login({
      password: this.passwordFormControl.value || '',
      email: this.emailFormControl.value || '',
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('access_token', response.token);

        // ✅ Success notification
        this.messageService.add({
          severity: 'success',
          summary: 'ورود موفق',
          detail: 'خوش آمدید',
          life: 3000,
        });

        setTimeout(() => {
          
          this.router.navigateByUrl('recepie/recepie-list');
        }, 1500);
      },
      error: () => {
        // ❌ Error notification
        this.messageService.add({
          severity: 'error',
          summary: 'خطا در ورود',
          detail: 'ایمیل یا رمز عبور اشتباه است.',
          life: 3000,
        });
      },
    });
  }
}
