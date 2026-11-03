import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { IngredientFormComponent } from '../ingredient/ingredient';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { RecepieService } from '../recepie.service';
import { Steps } from '../steps/steps';
import { Tags } from '../tags/tags';
import { baseUrl } from '../../baseConfig';
import { BehaviorSubject } from 'rxjs';
import { CategoryService } from '../../category/category.service';
import { TagsInputComponent } from '../../tag-input/tag-input';
import { MultiAutocompleteComponent } from '../../multi-select-autocomplete/multi-select-autocomplete';
import { MessageService } from 'primeng/api'; // Assuming a service like this exists
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';

interface Ingredient {
  name: string;
  amount: string;
  recipeID?: number;
}

interface Comment {
  id?: number;
  text: string;
  user_id: number;
  createdAt?: Date;
}

interface Rating {
  id?: number;
  value: number;
  user_id: number;
}

interface Favorite {
  id?: number;
  user_id: number;
}

@Component({
  selector: 'app-recepie-form',
  templateUrl: './recepie-create.html',
  styleUrls: ['./recepie-create.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    RouterModule,
    IngredientFormComponent,
    Steps,
    FormsModule,
    TagsInputComponent,
    MultiAutocompleteComponent,
    MatPaginatorModule, MatTabsModule, ToastModule,
    ButtonModule, RippleModule
  ],
  providers: [MessageService] // Add MessageService to providers
})
export class RecepieCreate implements OnInit {
  private _fb = inject(FormBuilder);
  private _route = inject(Router);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);
  private http = inject(HttpClient)
  private messageService = inject(MessageService); // Inject MessageService
  _recepieService = inject(RecepieService);
  _categorieService = inject(CategoryService);
  tag_names: any;
  tag_ids: any;
  // private _recipeService = inject(RecipeService);
  // private _authService = inject(AuthService);

  categoriesSubject = new BehaviorSubject<any[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  recipeForm!: FormGroup;
  isEditMode = false;
  recipeId?: number;
  ingredients: Ingredient[] = [];
  steps: any = [];
  tags: any = [];
  comments: Comment[] = [];
  ratings: Rating[] = [];
  favorites: Favorite[] = [];
  showIngredientForm = false;
  imageExist!: number;
  tagsData: [] = [];
  availableTags = [
    { name: 'Vegetarian', id: 1 },
    { name: 'Vegan', id: 2 },
    { name: 'Gluten-Free', id: 3 }
  ];

  itemsAsObjects = [{ id: 0, name: 'Angular', readonly: true }, { id: 1, name: 'React' }];

  autocompleteItems = ['Item1', 'item2', 'item3'];

  autocompleteItemsAsObjects = [
    { value: 'Item1', id: 0, extra: 0 },
    { value: 'item2', id: 1, extra: 1 },
    'item3'
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();

    setTimeout(() => {


      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEditMode == true;
          this.recipeId = +idParam;

          this._recepieService.getRecipeListById(this.recipeId).subscribe((response: any) => {
            this.setSelectedCategories(response.categories.map((item: any) => item.ID));
            this.tagsData = response.tags.map((item: any) => {
              this.tag_ids = this.tagsData;
              return { name: item.name, value: item.ID }
            })


            if (response.images.lenght != 0)
              this.imageExist = response.images[0];

            this.ingredients = response.ingredients;
            this.steps = response.steps;

            this.recipeForm.patchValue({
              title: response.title,
              text: response.text
            });

          });
        } else this.isEditMode == false;
      });
      this._categorieService.getCategoryList(0, {}).subscribe((response: any) => {
        this.categoriesSubject.next(response.data || {});
      })
    })
  }

  private initializeForm(): void {
    this.recipeForm = this._fb.group({
      title: ['', [Validators.required, Validators.maxLength(40)]],
      text: ['', [Validators.required]],
      category_ids: [''], // Add required validator
      ingredients: [],
      tags: [[]] // <-- stores array of strings
    });
  }

  setSelectedCategories(tagsId: any) {
    const selectedIds = [4, 15]; // for example, IDs you want selected
    this.recipeForm.get('category_ids')?.setValue(selectedIds);
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      this.recipeId = params['id'];

      if (this.recipeId) {
        this.isEditMode = true;
        this.loadRecipe(this.recipeId);
      } else {
        // For new recipe, set current user ID
        // const currentUser = this._authService.currentUser;
        // if (currentUser) {
        //   this.recipeForm.patchValue({ userID: currentUser.id });
        // }
      }
    });
  }

  private loadRecipe(id: number): void {
    // this._recipeService.getRecipe(id).subscribe(recipe => {
    //   this.recipeForm.patchValue({
    //     title: recipe.title,
    //     text: recipe.Text,
    //     prepTime: recipe.PrepTime,
    //     cookTime: recipe.CookTime,
    //     servings: recipe.Servings,
    //     Categories: recipe.Categories,
    //     imageUrl: recipe.ImageUrl,
    //     userID: recipe.UserID
    //   });
    //   
    //   this.ingredients = recipe.Ingridients || [];
    //   this.comments = recipe.Comments || [];
    //   this.ratings = recipe.Ratings || [];
    //   this.favorites = recipe.Favorited || [];
    // });
  }

  // Form control getters for template
  get title() { return this.recipeForm.get('title')!; }
  get text() { return this.recipeForm.get('text')!; }
  get Categories() {
    return this.recipeForm.get('Categories')!;
  }

  openAddIngredient(): void {
    this.showIngredientForm = true;
  }

  onIngredientAdded(ingredient?: Ingredient): void {
    if (ingredient) {
      this.ingredients.push(ingredient);
    }
    this.showIngredientForm = false;
  }

  removeIngredient(index: number): void {
    this.ingredients.splice(index, 1);
  }

  selectedFile?: File;
  formData = new FormData();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  //   availableTags = [
  //   { name: 'Vegetarian', id: 1 },
  //   { name: 'Vegan', id: 2 },
  //   { name: 'Gluten-Free', id: 3 }
  // ];

  onTagFilter(filter: any) {
    if (filter && !this.availableTags.some(t => t.name.toLowerCase() === filter.toLowerCase())) {
      this.availableTags = [...this.availableTags, { name: filter, id: Date.now() }];
    }
  }

  private getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  uploadImage(id: number): void {

    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);

    if (this.imageExist) {
      this.http.delete(`${baseUrl}recipe/${id}/image/${this.imageExist}`, {
        headers: this.getHeaders().delete('Content-Type')
      }).subscribe({
        next: () => {
          this.http.post(`${baseUrl}recipe/${id}/image`, formData, {
            headers: this.getHeaders().delete('Content-Type')
          }).subscribe({
            next: () => {
              console.log('آپلود تصویر موفق بود');
              this.messageService.add({
                severity: 'success',
                summary: 'موفق',
                detail: 'تصویر با موفقیت آپلود شد'
              });
            },
            error: (err) => {
              console.error('خطا در آپلود تصویر:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'خطا',
                detail: 'خطا در آپلود تصویر'
              });
            },
          });
        },
        error: (err) => {
          console.error('خطا در حذف تصویر قبلی:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: 'خطا در حذف تصویر قبلی'
          });
        },
      });
    } else {
      this.http.post(`${baseUrl}recipe/${id}/image`, formData, {
        headers: this.getHeaders().delete('Content-Type')
      }).subscribe({
        next: () => {
          console.log('آپلود تصویر موفق بود');
          this.messageService.add({
            severity: 'success',
            summary: 'موفق',
            detail: 'تصویر با موفقیت آپلود شد'
          });
        },
        error: (err) => {
          console.error('خطا در آپلود تصویر:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: 'خطا در آپلود تصویر'
          });
        },
      });
    }

  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'لطفا تمام فیلدها را پر کنید'
      });
      return;
    }

    const recipeData = {
      ...this.recipeForm.value,
      ingredients: this.ingredients,
      steps: this.steps,
      tags: this.tags,
      tag_ids: this.tag_ids,
      tag_names: this.tag_names
    };


    if (this.isEditMode && this.recipeId) {
      this._recepieService.editRecipe(recipeData, this.recipeId).subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'موفق',
            detail: 'برنامه غذایی تغییر کرد'
          });
          if (this.recipeId) this.uploadImage(+this.recipeId);
        },
        error: (err) => {
          console.error('خطا در ویرایش برنامه غذایی:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: 'خطا در ویرایش برنامه غذایی'
          });
        }
      });
    } else {
      this._recepieService.createRecipe(recipeData).subscribe({
        next: (response: any) => {
          console.log('ثبت موفق:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'موفق',
            detail: 'برنامه غذایی ثبت شد'
          });

          this.steps = [];
          this.ingredients = [];
          this.tags = [];

          this.uploadImage(response.id);
          setTimeout(() => {
            
            this._route.navigateByUrl(`recepie/recepie-edit/${response.id}`);
          }, 1500);
        },
        error: (err) => {
          console.error('خطا در ثبت برنامه غذایی:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: 'خطا در ثبت برنامه غذایی'
          });
        }
      });
    }
  }


  selectedTagAdded($event: any) {
    this.tag_ids = $event.map((item: any) => item.value);
  }

  tagAdded($event: any) {
    const cleaned = $event.filter((item: any) => item !== "");
    this.tag_names = cleaned;
  }

  getList($event: any) {
    this.ingredients = $event;
  }

  getSteps($event: any) {
    this.steps = $event;
  }

  getTags($event: any) {
    this.tags = $event;
  }

  onCancel(): void {
    this._location.back();
  }
}