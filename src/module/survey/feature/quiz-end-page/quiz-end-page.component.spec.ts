import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QuizEndPageComponent } from './quiz-end-page.component';

describe('QuizEndPageComponent', () => {
  let component: QuizEndPageComponent;
  let fixture: ComponentFixture<QuizEndPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizEndPageComponent, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuizEndPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate completion percentage correctly', () => {
    component.totalQuestions = 10;
    component.answeredQuestions = 8;
    expect(component.getCompletionPercentage()).toBe(80);
  });

  it('should return 0 for completion percentage when no questions', () => {
    component.totalQuestions = 0;
    component.answeredQuestions = 5;
    expect(component.getCompletionPercentage()).toBe(0);
  });
}); 