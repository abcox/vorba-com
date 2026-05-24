import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AboutAdamCoxPageComponent } from './about-adam-cox-page.component';

describe('AboutAdamCoxPageComponent', () => {
  let component: AboutAdamCoxPageComponent;
  let fixture: ComponentFixture<AboutAdamCoxPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutAdamCoxPageComponent],
      providers: [provideRouter([]), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutAdamCoxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
