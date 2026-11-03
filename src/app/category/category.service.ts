import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../baseConfig';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createRecipe(recipeModel: Recipe) {
    return this.http.post(
      baseUrl + 'recipe', 
      recipeModel,
      { headers: this.getAuthHeaders() }
    );
  }

  createCategory(recipeModel: any) {
    return this.http.post(
      baseUrl + 'category', 
      recipeModel,
      { headers: this.getAuthHeaders() }
    );
  }

  editCategory(recipeModel: any, id: number) {
    return this.http.put(
      baseUrl + 'category/' + id, 
      recipeModel,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCategory(id: number | string) {
    return this.http.delete(
      baseUrl + 'category/' + id,
      { headers: this.getAuthHeaders() }
    );
  }

  // Add similar methods for other endpoints
  getRecipes() {
    return this.http.get<Recipe[]>(
      baseUrl + 'recipes',
      { headers: this.getAuthHeaders() }
    );
  }

  getCategoryById(id: number) {
        return this.http.get(
        `${baseUrl}category/${id}`,  // Will proxy to http://localhost:3000/recipe
        { headers: this.getAuthHeaders() }
      );
  }

  // getCategoryList(pageIndex: number = 0) {
  //   return this.http.get<any[]>(
  //     baseUrl + `categories?offset=${pageIndex}&limit=20`,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  getCategoryList(pageIndex: number = 0, model: any) {
    return this.http.get(
      `${baseUrl}categories?offset=${pageIndex}&limit=20`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getAuthHeaders(), params: model }
    );
  }
}


export interface Ingredient {
  name: string;
  amount: number;
}

export interface Recipe {
  title: string;
  text: string;
  userId: number;
  ingredients: Ingredient[];
  tags: string[];
  categories: string[];
  steps: string[];
}