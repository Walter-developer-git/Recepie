import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecepieService } from '../recepie.service';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { MatIconModule } from '@angular/material/icon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../layout/navbar/user.service';

@Component({
  selector: 'app-recepie-detail',
  imports: [MatIconModule, CommonModule, FormsModule, RatingModule, ToastModule],
  templateUrl: './recepie-detail.html',
  styleUrls: ['./recepie-detail.scss'],
  standalone: true,
  providers: [MessageService]
})
export class RecepieDetail implements OnInit {
  private route = inject(ActivatedRoute);
  valueRate: any = 0;
  private _recepieService = inject(RecepieService);
  private _userService = inject(UserService);
  cd = inject(ChangeDetectorRef);
  private recipeSubject = new BehaviorSubject<any>(null);
  router = inject(Router);
  private _messageService = inject(MessageService);
  recipe$ = this.recipeSubject.asObservable();
  userId: any;
  recipeId!: number;
  commentsSubject = new BehaviorSubject<any[]>([]);
  comments$ = this.commentsSubject.asObservable();
  newCommentText = '';
  newCommentTitle = '';
  canModify: boolean = false;
  imageUrls: string = "assets/images/food-image.jpg";
  private nutritionSubject = new BehaviorSubject<any[]>([])
  nutritionData$ = this.nutritionSubject.asObservable();

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.recipeId = +idParam;
        this._recepieService.getRecipeListById(this.recipeId).subscribe((response: any) => {
          this.downloadImg(String(this.recipeId), response.images[0]);
          this.userId = response.user_id;

          this._userService.userModel$.subscribe((user: any) => {

            if (user.ID == this.userId || user.role === 'admin') {
              this.canModify = true;
            } else this.canModify = false;
          })

          // response.ingredients.forEach((ingredient: any) => {
          this._recepieService.getCalories(response.id).subscribe((res: any) => {
            this.nutritionSubject.next(res.nutritional_values || []);
          })

          this.recipeSubject.next(response || {});
          this.getRate();
        });
      }
    });
    this.loadComments();
  }

  private notify(severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) {
    this._messageService.add({ severity, summary, detail });
  }

  editRecipe() {
    this.router.navigateByUrl(`recepie/recepie-edit/` + this.recipeId)
  }

  filterByCategory(categoryId: number) {
    this.router.navigateByUrl(`recepie/recepie-list?category=${categoryId}`)
  }

  filterByTag(tagId: number) {
    this.router.navigateByUrl(`recepie/recepie-list?tag=${tagId}`)
  }

  deleteRecipe() {
    this._recepieService.deleteRecipe(this.recipeId).subscribe({
      next: () => {
        this.notify('success', 'موفقیت', 'برنامه غذایی با موفقیت حذف شد');
        setTimeout(() => {

          this.router.navigateByUrl(`recepie/recepie-list`);
        }, 1500);
      },
      error: (err) => {
        if (err.status == 403) {
          this.notify('error', 'خطا', 'شما اجازه ی حذف این دستور غذا را ندارید');
        } else {
          this.notify('error', 'خطا', 'خطا در حذف برنامه غذایی');
        }
      }
    });
  }

  loadComments() {
    this._recepieService.getCommentsByRecipe(this.recipeId).subscribe((response: any) => {
      this.commentsSubject.next([]);
      this.commentsSubject.next(response.data);
    });
  }

  submitComment() {
    if (!this.newCommentText.trim()) return;
    const comment: any = {
      recipe_id: this.recipeId,
      description: this.newCommentText,
      title: this.newCommentTitle,
    };
    this._recepieService.addComment({ ...comment, recipeId: this.recipeId }).subscribe(() => {
      this.loadComments();
      this.newCommentText = '';
      this.newCommentTitle = '';
      this.notify('success', 'ثبت نظر', 'نظر شما با موفقیت ثبت شد');
    });
  }

  deleteComment(commentId: any) {
    this._recepieService.deleteComment(commentId.ID).subscribe({
      next: () => {
        this.loadComments();
        this.notify('success', 'موفقیت', 'نظر با موفقیت حذف شد');
      },
      error: () => {
        this.notify('error', 'خطا', 'خطا در حذف نظر');
      }
    });
  }

  likeComment(comment: any) {
    this._recepieService.likeComment(comment.ID).subscribe(() => {
      const updated = this.commentsSubject.value.map(c =>
        c.ID === comment.ID ? { ...c, likes: (c.likes || 0) + 1 } : c
      );
      this.commentsSubject.next(updated);
    });
  }

  dislikeComment(comment: any) {
    this._recepieService.dislikeComment(comment.ID).subscribe(() => {
      const updated = this.commentsSubject.value.map(c =>
        c.ID === comment.ID ? { ...c, dislikes: (c.dislikes || 0) + 1 } : c
      );
      this.commentsSubject.next(updated);
    });
  }

  rate($event: any) {
    this._recepieService.rateRecipe(this.recipeId, $event.value).subscribe();
  }

  downloadImg(recipeID: string, imageId: string) {
    this._recepieService.getImageUrl(recipeID, imageId).subscribe(url => {
      this.imageUrls = url;
      this.cd.markForCheck();
    });
  }

  dislike() {
    this._recepieService.dislikeRecipe(this.recipeId).subscribe({
      next: () => {
        this.recipeSubject.next({
          ...this.recipeSubject.value,
          is_favorited: false,
          favorite_count: (this.recipeSubject.value.favorite_count ?? 0) - 1
        });
      }
    });
  }

  like() {
    this._recepieService.likeRecipe(this.recipeId).subscribe({
      next: () => {
        this.recipeSubject.next({
          ...this.recipeSubject.value,
          is_favorited: true,
          favorite_count: (this.recipeSubject.value.favorite_count ?? 0) + 1
        });
      }
    });
  }

  getRate() {
    this._recepieService.getRateRecipe(this.recipeId).subscribe((res: any) => {
      this.valueRate = res.average;
      this.cd.detectChanges()
    })
  }
}
