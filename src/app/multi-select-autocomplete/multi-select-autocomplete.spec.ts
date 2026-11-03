import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectAutocomplete } from './multi-select-autocomplete';

describe('MultiSelectAutocomplete', () => {
  let component: MultiSelectAutocomplete;
  let fixture: ComponentFixture<MultiSelectAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelectAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
