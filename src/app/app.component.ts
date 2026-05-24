import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
//import { OverlayContainer } from '@angular/cdk/overlay'; // todo: review what this is about
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SessionService } from './core/session/session.service';
import { DialogService } from './component/dialog/dialog.service';
import { HotkeyDirective } from "./directive/hotkey-directive";
import { ThemeService } from './services/theme.service';
import { FontService } from './services/font.service';

interface StoryModel {
  title: string;
  subtitle: string;
  overview: string;
  benefits: string[];
  approach: string[];
  summary: string;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HotkeyDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  themeService = inject(ThemeService);
  fontService = inject(FontService);
  sanitizer = inject(DomSanitizer);
  // TODO: is there a better way to assure a service is instantiated?  this way seems hacky
  private sessionService = inject(SessionService);
  title = 'Vorba';

  dialogService = inject(DialogService);

  placeholderImageQuality: 'high' | 'low' | 'standard' = 'standard';
  shorts$ = of<{ videoId: string }[]>([
    {
      videoId: 'fS4cH2fky5M',
    },
    {
      videoId: 'mVjYG9TSN88',
    },
  ]);

  //overlayContainer = inject(OverlayContainer);

  constructor(
    private matIconRegistry: MatIconRegistry,
  ) {
    this.registerSvgIcons();
  }
  
  registerSvgIcons() {
    const iconRootPath = '../../assets/icons/';
    const icons = [
      { name: 'check-outline' },
      { name: 'clock-outline' },
      { name: 'note-outline' },
      { name: 'world-outline' },
      /* { name: 'thumbs-up', filename: '' },
      { name: 'thumbs-down', filename: '' },
      { name: 'search', filename: '' },
      { name: 'home', filename: '' }, */
    ];
    icons.forEach(({ name }) => {
      this.matIconRegistry.addSvgIcon(
        name,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `${iconRootPath}${name}.svg`
        )
      );
    });
    //this.matIconRegistry.addSvgIcon(
    //  'thumbs-up',
    //  this.domSanitizer.bypassSecurityTrustResourceUrl(
    //    'assets/img/examples/thumbup-icon.svg'
    //  )
    //);
  }

  presentAdminLoginDialog  = (): void => {
    this.dialogService.openAdminLoginDialog();
  }

  toggleThemeHotkey = (): void => {
    this.themeService.toggleTheme();
  }

  toggleThemeColorNext = (): void => {
    this.themeService.selectNextSwatch();
  }

  toggleThemeColorPrevious = (): void => {
    this.themeService.selectPreviousSwatch();
  }

  toggleThemeFontNext = (): void => {
    this.fontService.selectNextFont();
  }

  toggleThemeFontPrevious = (): void => {
    this.fontService.selectPreviousFont();
  }
}
