import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ThankyouPageComponent } from './thankyou-page.component';

describe('ThankyouPageComponent', () => {
  let component: ThankyouPageComponent;
  let fixture: ComponentFixture<ThankyouPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThankyouPageComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThankyouPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
