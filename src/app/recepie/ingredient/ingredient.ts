// ingredient-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient.html',
  styleUrls: ['./ingredient.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,MatIconModule]
})
export class IngredientFormComponent implements OnInit {
  @Output() buttonClicked = new EventEmitter<any>();
  @Input() items: any[] = [];
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
      amount: ['', Validators.required],
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
  get amount() { return this.ingredientForm.get('amount')!; }

  deleteItem(index: number) {
    this.items.splice(index, 1);
    this.items = [...this.items]; // Trigger change detection
    this.buttonClicked.emit(this.items);
  }
 

onSubmit(): void {
  if (this.ingredientForm.valid) {
    const { name, amount } = this.ingredientForm.value;
    // const parsedAmount = Number(amount);
    
    // if (!Number.isFinite(parsedAmount)) {
      //   console.error('Amount must be a number');
      //   return;
      
      this.items.push({ name: name, amount: amount });
      this.items = [...this.items]; // Trigger change detection
      this.ingredientForm.reset({ recipeID: this.recipeId });
      this.buttonClicked.emit(this.items);
    } else  console.error('form not valid');
  }

  onCancel(): void {
    this._location.back();
  }
}