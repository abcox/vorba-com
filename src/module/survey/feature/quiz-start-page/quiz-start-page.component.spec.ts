import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { QuizStartPageComponent } from './quiz-start-page.component';

describe('QuizStartPageComponent', () => {
  let component: QuizStartPageComponent;
  let fixture: ComponentFixture<QuizStartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizStartPageComponent, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizStartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
