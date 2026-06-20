import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MenuToggleComponent } from './menu-toggle.component';
import { MenuService } from '../../../../../service/menu/menu.service';

class MenuServiceStub {
  private _menuOpen = signal(false);
  menuOpen = this._menuOpen.asReadonly();

  toggleMenu() {
    this._menuOpen.update(value => !value);
  }
}

describe('MenuToggleComponent', () => {
  let component: MenuToggleComponent;
  let fixture: ComponentFixture<MenuToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuToggleComponent],
      providers: [{ provide: MenuService, useClass: MenuServiceStub }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a 3-line burger toggle button', () => {
    const bars = fixture.debugElement.queryAll(By.css('[data-testid="menu-toggle-button"] .burger-line'));
    expect(bars.length).toBe(3);
  });

  it('should toggle aria-expanded and open class on click', () => {
    const button = fixture.debugElement.query(By.css('[data-testid="menu-toggle-button"]'));

    expect(button.nativeElement.getAttribute('aria-expanded')).toBe('false');
    expect(button.nativeElement.classList.contains('open')).toBeFalse();

    button.nativeElement.click();
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('aria-expanded')).toBe('true');
    expect(button.nativeElement.classList.contains('open')).toBeTrue();
  });
});
