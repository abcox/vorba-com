import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseStudyPageComponent } from './case-study-page.component';

describe('CaseStudyPageComponent', () => {
  let component: CaseStudyPageComponent;
  let fixture: ComponentFixture<CaseStudyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStudyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseStudyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
