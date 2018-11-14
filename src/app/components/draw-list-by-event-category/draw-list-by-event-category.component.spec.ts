import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawListByEventCategoryComponent } from './draw-list-by-event-category.component';

describe('DrawListByEventCategoryComponent', () => {
  let component: DrawListByEventCategoryComponent;
  let fixture: ComponentFixture<DrawListByEventCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawListByEventCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawListByEventCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
