import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,MatIconModule],
  templateUrl: './tags.html',
  styleUrl: './tags.scss'
})
export class Tags {
  @Output() buttonClicked = new EventEmitter<any>();
  @Input() items: {name: string}[] = [];
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _location = inject(Location);

  ingredientForm!: FormGroup;
  isEditMode = false;
  ingredientId?: number;
  recipeId?: number;

  ngOnInit(): void {
    this.ingredientForm = this._fb.group({
      name: ['', Validators.required],
      recipeID: ['']
    });

    this._route.params.subscribe(params => {
      this.recipeId = params['recipeId'];
      this.ingredientId = params['ingredientId'];

      if (this.ingredientId) {
        this.isEditMode = true;
        this.loadIngredient(this.ingredientId);
      } else {
        this.ingredientForm.patchValue({ recipeID: this.recipeId });
      }
    });
  }

  private loadIngredient(id: number): void {
    // this._ingredientService.getIngredient(id).subscribe(ingredient => {
    //   this.ingredientForm.patchValue(ingredient);
    //   this.recipeId = ingredient.recipeID;
    // });
  }

  get name() { return this.ingredientForm.get('name')!; }
  get order() { return this.ingredientForm.get('order')!; }

  deleteItem(index: number) {
    this.items.splice(index, 1);
    this.items = [...this.items]; // Trigger change detection
  }
 

onSubmit(): void {
  if (this.ingredientForm.valid) {
    const { name } = this.ingredientForm.value;

    this.items.push({ name });
    this.items = [...this.items]; // Trigger change detection
    this.ingredientForm.reset({ recipeID: this.recipeId });
    this.buttonClicked.emit(this.items);
  }
}

  onCancel(): void {
    // this._location.back();
  }
}
