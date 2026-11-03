import {LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips with form control
 */
@Component({
  selector: 'tag-input',
  templateUrl: 'tag-input.html',
  styleUrl: 'tag-input.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputComponent {
  @Output() addedTag = new EventEmitter<any>();
  keywords = signal(['']);
  readonly formControl = new FormControl(['angular']);

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    this.keywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword}`);
      this.addedTag.emit(keywords);
      return [...keywords];
    });
  }

  add(event: any): void {
    const value = (event.value || '').trim();

    
    // Add our keyword
    if (value) {
      this.keywords.update(keywords => [...keywords, value]);
    }
    this.addedTag.emit(this.keywords());

    // Clear the input value
    event.chipInput!.clear();
  }
}
