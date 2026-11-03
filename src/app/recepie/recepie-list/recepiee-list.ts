import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RecepieService } from '../recepie.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryService } from '../../category/category.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MultiAutocompleteComponent } from '../../multi-select-autocomplete/multi-select-autocomplete';
import { UserService } from '../../layout/navbar/user.service';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-recepiee-list',
  imports: [MatIconModule, CommonModule, ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    RouterModule,
    MultiAutocompleteComponent,
    // Steps,
    FormsModule,
    MatSliderModule
    // TagsInputComponent,
    // MultiAutocompleteComponent

  ],
  templateUrl: './recepiee-list.html',
  styleUrl: './recepiee-list.scss',
  standalone: true
})
export class RecepieeList {
  form!: FormGroup;
  recipeList: any;
  tag_ids: any;
  isLiked = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  _recepieService = inject(RecepieService);
  fb = inject(FormBuilder);
  notFound$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  _categoryService = inject(CategoryService);
  currentPage = 0;
  pageSize = 6; // how many recipes per page
  pagedRecipes: any[] = [];
  totalPages = 1;

maxValue = 850;

calorieRange = { min: 0, max: this.maxValue };
proteinRange = { min: 0, max: this.maxValue };
nutritionalRange = { min: 0, max: this.maxValue };
carbohydrateRange = { min: 0, max: this.maxValue };
fatRange = { min: 0, max: this.maxValue };
sugarRange = { min: 0, max: this.maxValue };
fiberRange = { min: 0, max: this.maxValue };

onRangeChange(event: Event, key: string, side: 'min' | 'max'): void {
  const input = event.target as HTMLInputElement;
  (this as any)[key][side] = input.valueAsNumber;
}
  sortOptions = [
    { value: 'title_asc', label: 'عنوان (صعودی)' },
    { value: 'title_desc', label: 'عنوان (نزولی)' },
    { value: 'created_asc', label: 'تاریخ ایجاد (قدیمی‌ترین)' },
    { value: 'created_desc', label: 'تاریخ ایجاد (جدیدترین)' },
    { value: 'rating_desc', label: 'بالاترین امتیاز' },
    { value: 'favorites_desc', label: 'بیشترین علاقه‌مندی‌ها' },
  ];

  private recipeListSubject = new BehaviorSubject<any[]>([]);
  recipeList$ = this.recipeListSubject.asObservable(); // Observable for template

  private categorySubject = new BehaviorSubject<any[]>([]);
  category$ = this.categorySubject.asObservable(); // Observable for template


  imageSrc?: string;

  ngOnInit(): void {

    this.form = this.fb.group({
      title: [''],
      ingredient: [''],
      sortOrder: ['title_asc']
    });

    this.route.queryParamMap.subscribe(params => {
      let category = params.get('category'); // will be string or null
      let tag = params.get('tag'); // will be string or null
      
      if (tag) {
        this.tag_ids = [ +tag ];
        this.search();
      }

      this.search();
      if (category) {
        let categoryId = +category; // convert to number
        this.getRecipeList(0, { category_ids: categoryId });
      }
      else this.getRecipeList();
    })
  }

  getRecipeList(pageIndex: number = 0, model = {}) {
    this._recepieService.getRecipeList(pageIndex, model).subscribe((response: any) => {
      const recipes = response.data || [];
      const pageSize = 20; // fixed
      let totalItems = response.count; // total rows/items from backend
      this.totalPages = Math.ceil(totalItems / pageSize);
      if (response.count == 0)
        this.notFound$.next(true);
      else this.notFound$.next(false);

      recipes.forEach((r: any) => {
        if (r.images?.length) {
          this._recepieService.getImageUrl(r.id, r.images[0]).subscribe(res => {
            r.imageUrl = res; // attach the image URL to the recipe object

            // update BehaviorSubject so Angular picks up the change
            this.recipeListSubject.next([...recipes]);
          });
        }
      });

      // initially set the list (without images yet)
      this.recipeListSubject.next(recipes);

      this.getCategories();
    });
  }


  imageUrls: { [recipeId: string]: string } = {};

  downloadImg(recipeID: string, imageId: string) {
    this._recepieService.getImageUrl(recipeID, imageId).subscribe(url => {
      this.imageUrls[recipeID] = url;
    });
  }

  getCategories() {
    // this
  }

  selectedTagAdded($event: any) {
    this.tag_ids = $event.map((item: any) => {
      return item.value
    })
  }

  resetFilter() {
    this.getRecipeList(0, {})
  }

  openRecipie(item: any) {
    this.router.navigateByUrl(`recepie/recepie-detail/` + item.id)
  }

  likeRecipie($event: Event, item: any) {
    $event.stopPropagation();
    this._recepieService.likeRecipe({ recipe_id: item.id }).subscribe(res => {
    })

  }

  nextPage() {
    this.currentPage = this.currentPage + 1
    this.getRecipeList(this.currentPage);
  }

  prevPage() {
    // if (this.currentPage > 1) {
    this.currentPage = this.currentPage - 1
    this.getRecipeList(this.currentPage);
    // }
  }

  search() {

    const payload: any = {};

    if(this.fatRange.min > 0 || this.fatRange.max < this.maxValue) {
      payload.min_fat = this.fatRange.min;
      payload.max_fat = this.fatRange.max;
    }
    if(this.proteinRange.min > 0 || this.proteinRange.max < this.maxValue) {
      payload.min_protein = this.proteinRange.min;
      payload.max_protein = this.proteinRange.max;
    }
    if(this.nutritionalRange.min > 0 || this.nutritionalRange.max < this.maxValue) {
      payload.min_nutritional = this.nutritionalRange.min;
      payload.max_nutritional = this.nutritionalRange.max;
    }
    if(this.calorieRange.min > 0 || this.calorieRange.max < this.maxValue) {
      payload.min_calorie = this.calorieRange.min;
      payload.max_calorie = this.calorieRange.max;
    }
    if(this.carbohydrateRange.min > 0 || this.carbohydrateRange.max < this.maxValue) {
      payload.min_carbs = this.carbohydrateRange.min;
      payload.max_carbs = this.carbohydrateRange.max;
    }
    if(this.sugarRange.min > 0 || this.sugarRange.max < this.maxValue) {
      payload.min_sugar = this.sugarRange.min;
      payload.max_sugar = this.sugarRange.max;
    }
    if(this.fiberRange.min > 0 || this.fiberRange.max < this.maxValue) {
      payload.min_fiber = this.fiberRange.min;
      payload.max_fiber = this.fiberRange.max;
    }
    

    if (this.form.get('title')?.value) {
      payload.title = this.form.get('title')?.value;
    }

    if (this.tag_ids && this.tag_ids.length > 0) {
      payload.tag_ids = this.tag_ids.join(',');
    }

    if (this.form.get('ingredient')?.value) {
      payload.ingredient = this.form.get('ingredient')?.value;
    }

    if (this.form.get('sortOrder')?.value) {
      payload.sortOrder = this.form.get('sortOrder')?.value;
    }
    this.getRecipeList(0, payload)
  }

  reset() {

  }
}
