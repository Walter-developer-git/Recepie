import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepieeList } from './recepiee-list';

describe('RecepieeList', () => {
  let component: RecepieeList;
  let fixture: ComponentFixture<RecepieeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepieeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepieeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
