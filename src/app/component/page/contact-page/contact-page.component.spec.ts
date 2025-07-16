import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPageComponent } from './contact-page.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EmailService } from '@backend-api/v1/api/email.service';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';

describe('ContactPageComponent', () => {
  let component: ContactPageComponent;
  let fixture: ComponentFixture<ContactPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [
        provideHttpClientTesting(),
        EmailService,
        { provide: MatIconRegistry, useValue: { addSvgIcon: () => {}, getNamedSvgIcon: () => of('') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
