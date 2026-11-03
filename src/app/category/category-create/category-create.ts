import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CategoryService } from '../category.service';
import { RecepieService } from '../../recepie/recepie.service';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../layout/navbar/user.service';

@Component({
  selector: 'app-category-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    RouterModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './category-create.html',
  styleUrls: ['./category-create.scss']
})
export class CategoryCreate implements OnInit {
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private route = inject(Router);
  private _location = inject(Location);
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  _categoryService = inject(CategoryService);
  _recepieService = inject(RecepieService);
  userService = inject(UserService);

  private recipeListSubject = new BehaviorSubject<any[]>([]);
  recipeList$ = this.recipeListSubject.asObservable();

  recipeForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  showIngredientForm = false;
  selectedFile: File | null = null;

  recipesList = [
    { value: 'easy', viewValue: 'ساده' },
    { value: 'medium', viewValue: 'متوسط' },
    { value: 'hard', viewValue: 'سخت' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
    this.loadRecipe();

    this.userService.isAdmin$.subscribe(isAdmin => {
      if (!isAdmin) {
        this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'شما دسترسی ویرایش این صفحه را ندارید' });
        setTimeout(() => {

          this.route.navigateByUrl('category/category-list');
        }, 1500);
      }
    }
    )

    setTimeout(() => {
      this._route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEditMode = true;
          this.categoryId = +idParam;

          this._categoryService.getCategoryById(this.categoryId).subscribe({
            next: (response: any) => {
              this.recipeForm.patchValue({
                title: response.data.name
              });
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در بارگذاری دسته‌بندی' });
            }
          });
        } else this.isEditMode = false;
      });
    });
  }

  private initializeForm(): void {
    this.recipeForm = this._fb.group({
      title: [''],
      Text: [''],
      Recipes: [''],
    });
  }

  private checkEditMode(): void {
    this._route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.isEditMode = !!this.categoryId;
      if (this.isEditMode) this.loadRecipe();
    });
  }

  private loadRecipe(): void {
    this._recepieService.getRecipeList(0, {}).subscribe({
      next: (response: any) => {
        this.recipeListSubject.next(response.data || []);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در بارگذاری برنامه‌ها' });
      }
    });
  }

  get title() { return this.recipeForm.get('title')!; }
  get Recipes() { return this.recipeForm.get('Recipes')!; }

  openAddIngredient(): void {
    this.showIngredientForm = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post('/api/upload', formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'موفقیت', detail: 'تصویر با موفقیت آپلود شد' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در آپلود تصویر' });
      },
    });
  }

  deletecategory() {
    if (this.categoryId) {
      this._categoryService.deleteCategory(this.categoryId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'موفقیت', detail: 'دسته‌بندی با موفقیت حذف شد' });
          setTimeout(() => {

            this.route.navigateByUrl('category/category-list');
          }, 1500);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در حذف دسته‌بندی' });
        }
      });
    }
  }

  onCancel(): void {
    this._location.back();
  }

  onSubmit() {
    if (!this.categoryId) {
      const titleVal = this.recipeForm.get('title')?.value;
      if (titleVal) {
        this._categoryService.createCategory({ name: titleVal }).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'موفقیت', detail: 'دسته‌بندی جدید با موفقیت ایجاد شد' }),
          error: () => this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در ایجاد دسته‌بندی' })
        });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'اخطار', detail: 'عنوان دسته‌بندی نباید خالی باشد' });
      }
    } else {
      this._categoryService.editCategory({ name: this.recipeForm.get('title')?.value }, this.categoryId).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'موفقیت', detail: 'دسته‌بندی با موفقیت ویرایش شد' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در ویرایش دسته‌بندی' })
      });
    }
  }
}
