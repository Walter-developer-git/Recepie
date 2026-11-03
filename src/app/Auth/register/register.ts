import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MyErrorStateMatcher } from '../login/login';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

// ✅ PrimeNG Toast
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [AuthService, MessageService], // <-- added MessageService
  standalone: true
})
export class Register {
  firstNameFormControl = new FormControl('', Validators.required);
  lastNameFormControl = new FormControl('', Validators.required);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  matcher = new MyErrorStateMatcher();
  _authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService); // ✅ inject Toast service

  constructor() { 
    localStorage.clear();
  }

  loading = {
    isLoading: () => false,
  };

  register(): void {
    this._authService.register({
      name: this.firstNameFormControl.value || '',
      last_name: this.lastNameFormControl.value || '',
      email: this.emailFormControl.value || '',
      password: this.passwordFormControl.value || ''
    }).subscribe({
      next: () => {
        // ✅ Success notification
        this.messageService.add({
          severity: 'success',
          summary: 'ثبت‌نام موفق',
          detail: 'اکانت شما با موفقیت ایجاد شد.',
          life: 3000
        });
        setTimeout(() => {          
          this.router.navigateByUrl('auth/login');
        }, 1500);
      },
      error: () => {
        // ❌ Error notification
        this.messageService.add({
          severity: 'error',
          summary: 'خطا در ثبت‌نام',
          detail: 'ایمیل یا رمز عبور نامعتبر است.',
          life: 3000
        });
      }
    });
  }
}
