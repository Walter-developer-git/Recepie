import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../baseConfig';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecepieService {
  private http = inject(HttpClient);

  // For development with proxy

  // For production (uncomment when needed)
  // private baseUrl = 'http://your-production-api.com';

  private getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createRecipe(recipeModel: FormData) {
    return this.http.post(
      `${baseUrl}recipe`,  // Will proxy to http://localhost:3000/recipe
      recipeModel,
      { headers: this.getHeaders() }
    );
  }

  editRecipe(recipeModel: FormData, id: number) {
    return this.http.put(
      `${baseUrl}recipe/${id}`,  // Will proxy to http://localhost:3000/recipe
      recipeModel,
      { headers: this.getHeaders() }
    );
  }

  deleteRecipe(id: number) {
    return this.http.delete(
      `${baseUrl}recipe/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getRecipeList(pageIndex: number = 1, model: any) {
    return this.http.get(
      `${baseUrl}recipe/list?offset=${pageIndex}&limit=20`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders(), params: model }
    );
  }

  getImageUrl(recipeID: string, imageId: string): Observable<string> {
    return this.http
      .get(`${baseUrl}recipe/${recipeID}/image/${imageId}`, {
        responseType: 'blob', // get binary data
        headers: this.getHeaders()
      })
      .pipe(
        map((blob) => URL.createObjectURL(blob)) // convert blob to object URL
      );
  }

  getRecipeListById(id: number) {
    return this.http.get(
      `${baseUrl}recipe/${id}`,  // Will proxy to http://localhost:3000/recipe
      { headers: this.getHeaders() }
    );
  }

  addComment(comment: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}comment`, comment, { headers: this.getHeaders() });
  }

  // DELETE /comment/:id
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}comment/${commentId}`, { headers: this.getHeaders() });
  }

  // POST /comment/:id/like
  likeComment(commentId: number): Observable<void> {
    return this.http.post<void>(`${baseUrl}comment/${commentId}/like/inc`, {}, { headers: this.getHeaders() });
  }

  // POST /comment/:id/dislike
  dislikeComment(commentId: number): Observable<void> {
    return this.http.post<void>(`${baseUrl}comment/${commentId}/like/dec`, {}, { headers: this.getHeaders() });
  }

  // Optional: fetch comments for a recipe
  getCommentsByRecipe(recipeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}recipe/${recipeId}/comments?offset=0&limit=20`, { headers: this.getHeaders() });
  }

  likeRecipe(model: any) {
    return this.http.post<void>(`${baseUrl}favorite`, {recipe_id: model}, { headers: this.getHeaders() });
  }

  dislikeRecipe(id: any) {
    return this.http.delete<void>(`${baseUrl}unfavorite?recipe_id=${id}`, { headers: this.getHeaders() });
  }

  rateRecipe(recipe_id: any, score: number) {
    return this.http.post<void>(`${baseUrl}rating`, { recipe_id, score }, { headers: this.getHeaders() });
  }

  getRateRecipe(recipe_id: number) {
    console.log('sdasd', recipe_id);

    return this.http.get<void>(`${baseUrl}recipe/${recipe_id}/rating`, { headers: this.getHeaders() });
  }

  getTags() {
    return this.http.get<void>(`${baseUrl}tags?offset=0&limit=20`, { headers: this.getHeaders() });
  }

  getCalories(recipeId: number) {
    return this.http.get<void>(`${baseUrl}recipe/${recipeId}/calories`, { headers: this.getHeaders() });
  }

  removeLikeRecipe(id: any) {
    return this.http.post<void>(`${baseUrl}favorite/` + id, { headers: this.getHeaders() });
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
  userID: number
}