import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDialogComponent, ContactDialogData } from './contact-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ContactDialogComponent', () => {
  let component: ContactDialogComponent;
  let fixture: ComponentFixture<ContactDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ContactDialogComponent>>;
  let router: jasmine.SpyObj<Router>;

  const mockDialogData: ContactDialogData = {
    title: 'Test Title',
    message: 'Test Message',
    isSuccess: true,
    shouldNavigate: true
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ContactDialogComponent,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and message', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain(mockDialogData.title);
    expect(compiled.querySelector('mat-dialog-content').textContent).toContain(mockDialogData.message);
  });

  it('should apply success styling when isSuccess is true', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h2');
    expect(titleElement.classList).toContain('text-green-600');
  });

  it('should apply error styling when isSuccess is false', () => {
    component.data.isSuccess = false;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h2');
    expect(titleElement.classList).toContain('text-red-600');
  });

  it('should close dialog and navigate on success', () => {
    component.onClose();
    
    expect(dialogRef.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should only close dialog without navigation when shouldNavigate is false', () => {
    component.data.shouldNavigate = false;
    component.onClose();
    
    expect(dialogRef.close).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
}); 