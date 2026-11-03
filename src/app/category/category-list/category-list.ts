import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../category.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MultiAutocompleteComponent } from '../../multi-select-autocomplete/multi-select-autocomplete';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../layout/navbar/user.service';

@Component({
  selector: 'app-category',
  imports: [
    MatIconModule, CommonModule, ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    RouterModule,
    MultiAutocompleteComponent,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  standalone: true,
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList {
  form!: FormGroup;
  private _router = inject(Router);
  _categoryService = inject(CategoryService);
  userService = inject(UserService);
  private categorySubject = new BehaviorSubject<any[]>([]);
  category$ = this.categorySubject.asObservable(); // Observable for template
  currentPage = 0;
  pageSize = 6; // how many recipes per page
  pagedRecipes: any[] = [];
  totalPages = 1;
  tag_ids: any;
  fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  sortOptions = [
    { value: 'title_asc', label: 'عنوان (صعودی)' },
    { value: 'title_desc', label: 'عنوان (نزولی)' }
  ];

  ngOnInit(): void {
    this.getCategoryList(0, {})
    this.form = this.fb.group({
      name: [''],
      ingredient: [''],
      sortOrder: ['title_asc']
    });
  }

  clickCategory($event: Event, item: any) {
    $event.stopPropagation()
    this._router.navigateByUrl('category/category-edit/' + item.ID)
  }

  getCategoryList(pageIndex = 0, model = {}) {
    this._categoryService.getCategoryList(pageIndex, model).subscribe({
      next: (response: any) => {
        const pageSize = 20; // fixed
        let totalItems = response.count; // total rows/items from backend
        this.totalPages = Math.ceil(totalItems / pageSize);
        this.categorySubject.next(response.data || []);

        this.messageService.add({
          severity: 'success',
          summary: 'موفقیت',
          detail: 'لیست دسته‌بندی‌ها با موفقیت بارگذاری شد'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطا',
          detail: 'خطا در بارگذاری لیست دسته‌بندی‌ها'
        });
      }
    });
  }

  selectCard(item: any) {
    this._router.navigateByUrl(`recepie/recepie-list?category=${item.ID}`)
  }

  onSubmit(): void {
    this._router.navigateByUrl('category/category-create')
  }

  nextPage() {
    this.currentPage = this.currentPage + 1
    this.getCategoryList(this.currentPage);
  }

  prevPage() {
    this.currentPage = this.currentPage - 1
    this.getCategoryList(this.currentPage);
  }

  selectedTagAdded($event: any) {
    this.tag_ids = $event.map((item: any) => {
      return item.value
    })
  }

  search() {
    const payload: any = {};

    if (this.form.get('name')?.value) {
      payload.name = this.form.get('name')?.value;
    }

    if (this.form.get('sortOrder')?.value) {
      payload.sortOrder = this.form.get('sortOrder')?.value;
    }

    this.getCategoryList(0, payload)
  }

  reset() {
    this.form.reset({
      title: '',
      ingredient: '',
      sortOrder: 'title_asc'
    });
    this.tag_ids = [];
    this.getCategoryList(0, {});

    this.messageService.add({
      severity: 'info',
      summary: 'بازنشانی',
      detail: 'فیلترها بازنشانی شدند'
    });
  }
}
