import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HumanNeedsPageComponent } from './human-needs-page.component';

describe('HumanNeedsPageComponent answer navigation', () => {
  let component: HumanNeedsPageComponent;
  let fixture: ComponentFixture<HumanNeedsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HumanNeedsPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HumanNeedsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('advances after an answer is selected', fakeAsync(() => {
    component.selectAnswer('yes');

    tick(500);
    fixture.detectChanges();
    tick(0);

    expect(component.currentIndex()).toBe(1);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('h2[tabindex="-1"]'));
  }));

  it('stays on a reviewed question when its answer is changed', fakeAsync(() => {
    component.selectAnswer('yes');
    tick(500);
    component.previousQuestion();
    component.selectAnswer('partly');
    tick(500);

    expect(component.currentIndex()).toBe(0);
    expect(component.currentAnswer()).toBe('partly');
    expect(component.scores().total).toBe(5);
    expect(component.showResults()).toBeFalse();
  }));

  it('cancels auto-advance when an answer is changed before the delay ends', fakeAsync(() => {
    component.selectAnswer('yes');
    tick(250);
    component.selectAnswer('no');
    tick(500);

    expect(component.currentIndex()).toBe(0);
    expect(component.currentAnswer()).toBe('no');

    component.nextQuestionOrShowResults();
    tick(0);
    expect(component.currentIndex()).toBe(1);
  }));

  it('shows results after answering the final question', fakeAsync(() => {
    component.currentIndex.set(component.questions.length - 1);
    component.selectAnswer('partly');

    tick(500);

    expect(component.showResults()).toBeTrue();
  }));

  it('cancels a pending advance when navigating back', fakeAsync(() => {
    component.currentIndex.set(1);
    component.selectAnswer('no');
    component.previousQuestion();

    tick(500);

    expect(component.currentIndex()).toBe(0);
  }));

  it('computes export data containing answers, vector subtotals, and total', () => {
    component.selectAnswer('yes');
    component.currentIndex.set(1);
    component.selectAnswer('partly');

    const exportData = component.exportData();
    expect(exportData.answers[0]).toBe('yes');
    expect(exportData.answers[1]).toBe('partly');
    expect(exportData.answers.length).toBe(component.questions.length);
    expect(exportData.subtotals['significant']).toBeGreaterThanOrEqual(0);
    expect(exportData.total).toBe(15);
  });

  it('renders export button on the results view and calls downloadResults on click', () => {
    spyOn(component, 'downloadResults');
    component.showResults.set(true);
    fixture.detectChanges();

    const exportButton = fixture.nativeElement.querySelector('.export-button') as HTMLButtonElement;
    expect(exportButton).toBeTruthy();
    expect(exportButton.textContent).toContain('Export results (JSON)');

    exportButton.click();
    expect(component.downloadResults).toHaveBeenCalled();
  });
});