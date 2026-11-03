import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RecepieService } from '../recepie/recepie.service';

/**
 * @title Highlight the first autocomplete option
 */
@Component({
  selector: 'multi-select-autocomplete',
  templateUrl: 'multi-select-autocomplete.html',
  styleUrl: 'multi-select-autocomplete.scss',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
  ],
})
export class MultiAutocompleteComponent implements OnInit {
  private _keywords: { name: string; value: number }[] = [];

  @Input()
  get keywords(): { name: string; value: number }[] {
    return this._keywords;
  }

  set keywords(value: { name: string; value: number }[]) {
    this._keywords = value || [];
    // this.filteredOptions.subscribe(para => {
    // })


    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        this.options = this.options.filter(item =>
          !this.keywords.some(ele => ele.value === item.value)
        );
        this.addedTag.emit(this.keywords);
        return this.options
      }
      ),
    );
  }
  myControl = new FormControl('');
  options: any[] = [];
  filteredOptions!: Observable<any[]>;
  tagValue: any;
  @Output() addedTag = new EventEmitter<any>();
  readonly formControl = new FormControl(['angular']);
  _recepieService = inject(RecepieService);

  ngOnInit() {
    this._recepieService.getTags().subscribe((response: any) => {      
      this.options = response.data.map((item: any) => {

        return { name: item.name, value: item.ID }
      })


      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filter(value || '')
        }
        ),
      );
    }
    )

  }

  onOptionSelected(value: string) {
    let obj = this.options.find(index => index.value == value)

    this.add(obj);
    this.myControl.setValue('');
  }

  onEnterPressed(event: any) {
    // event.preventDefault(); // prevent form submission if inside a form
    // let obj = this.options.find(index => index.value == value)
    // this.add(this.myControl.value || '');
    // this.myControl.setValue('');
  }

  private _filter(value: any) {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  removeKeyword(keyword: any) {
    let index = this.keywords.findIndex(item => item.value == keyword.value)
    this.keywords.splice(index, 1);
    this.options.push(keyword);

    this.addedTag.emit(this.keywords)
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filter(value || '')
      }
      ),
    );
  }

  add(value: { name: string; value: number }): void {
    if (!value) return;

    // Prevent duplicates
    const exists = this.keywords.some(k => k.value === value.value);
    if (!exists) {
      this.keywords.push(value);
    }

    this.addedTag.emit(this.keywords);

    // Clear the input value
    this.myControl.setValue('');

    let index = this.options.findIndex(item => item.value == value.value);
    this.options.splice(index, 1)

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filter(value || '')
      }
      ),
    );


  }

}
