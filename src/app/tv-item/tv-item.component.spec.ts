import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvItemComponent } from './tv-item.component';

describe('TvItemComponent', () => {
  let component: TvItemComponent;
  let fixture: ComponentFixture<TvItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
