import { Component, inject } from '@angular/core';
import { ThemeService } from '@app/services/theme.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  readonly themeService = inject(ThemeService);
}
