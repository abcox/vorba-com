import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { OverlayContainer } from '@angular/cdk/overlay'; // todo: review what this is about
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CarouselComponent } from './component/carousel/carousel.component';
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { YouTubePlayer/* , YOUTUBE_PLAYER_CONFIG */ } from '@angular/youtube-player';
import { HeaderComponent } from './component/layout/header/header.component';
import { FooterComponent } from './component/layout/footer/footer.component';
import { SessionService } from './core/session/session.service';
import { MenuBannerComponent } from './component/layout/header/_component/menu-banner/menu-banner.component';
import { DialogService } from './component/dialog/dialog.service';
import { HotkeyDirective } from "./directive/hotkey-directive";

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
  imports: [CommonModule, FormsModule, MatButtonToggleModule,
    MatCardModule, MatDialogModule, MatIconModule, MatSlideToggleModule, MatSnackBarModule, RouterOutlet,
    CarouselComponent, YouTubePlayer, HeaderComponent, FooterComponent,
    MenuBannerComponent, HotkeyDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  sanitizer = inject(DomSanitizer);
  // TODO: is there a better way to assure a service is instantiated?  this way seems hacky
  private sessionService = inject(SessionService);
  title = 'Vorba';
  //theme = 'dark';
  isLightTheme = false;

  dialogService = inject(DialogService);

  stories$ = of<StoryModel[]>([
    {
      title: 'Success Story 1',
      subtitle: 'Modernize System',
      overview: 'Our customer has a critical part of their main business workflow dependent on a system that was\
        built over 10 years ago.  While they are able to maintain this system, the risk of doing so increases.\
        It is also a barrier to them developing their service offering.  Due to the complexity and technical\
        debt of the current system, our customer\'s previous attempts to modernize it have failed.',
      benefits: [
        'increase supportability of the system',
        'decrease cost to support',
        'able to extend feature-set while maintaining level of support cost',
      ],
      approach: [
        'collect and analyse the existing system',
        'collect and analyse the documented (and undocumented) SOPs',
        'document analysis and scope of work',
      ],
      summary: 'Our disciplined approach and no-problem attitude provide the foundation for delivering the success\
        to our customer.  We bring expertise across all problem domains including the personel.  True story,\
        when we engaged with our client, they required to bring their SME from retirement in order to help\
        assure our work.  When we originally interviewed the client, we were informed of the long and troubled\
        history of this work.  We offered our client\'s person our guarantee and worked professionally and delivered\
        to them the success that they were banking on.'
    }, {
      title: 'Success Story 2',
      subtitle: 'Extend System',
      overview: 'Our customer wishes to realize a new line of revenue that depends on extending their current systems.\
        They have their requirements, and have attempted on a few occassions to produce a feature from their backlog\
        that will realize them this new line of revenue.  However, the difficult nature of this feature (a rate calculator)\
        has been a barrier to its successful delivery.',
      benefits: [
        'deliver supportable system feature',
        'maintain sensitivity to current working environment',
        'deliver new line of revenue, and supportable feature',
      ],
      approach: [
        'gather and analyse the existing requirements',
        'analyse the documented (and undocumented) SOPs',
        'document analysis and scope of work',
        'interview and train user group members'
      ],
      summary: 'Our disciplined approach and no-problem attitude provide the foundation for delivering the success\
        to our customer.  We bring expertise across all problem domains including the personel.  True story,\
        the requirements had critical gaps that would required closure as a precondition of successful delivery\
        of this feature.  During our agile approach, we identified this gaps, coached our customer through to\
        their resolve, and went on to deliver a successful feature both affordable and maintainable.  Our customer\
        reported ROI within the first year of operation.',
    }, {
      title: 'Success Story 3',
      subtitle: 'Proof of Concept',
      overview: 'Our customer needs to prove a concept requiring MVP-style deliver. Our agile approach will provide\
        them the opportunity to augment their existing team, and show-case their technical prowess in the form\
        of new features that are heavilty reactive and UX focused.',
      benefits: [
        'work with existing, agile team structure',
        'maintain sensitivity to current working environment',
        'show-case new opportunities',
      ],
      approach: [
        'gather and analyse the existing team SOPs',
        'analyse business area knowledge',
        'learn from, and coach and train teammates',
      ],
      summary: 'Our disciplined approach and no-problem attitude provide the foundation for delivering the success\
        to our customer.  We bring expertise across all problem domains including the personel.  Our client\
        had their budgets locked in and time-lines narrowing fast.  We were able to increase bandwidth and\
        provide their work-force with fresh perspectives and new and innovative ways to reduce time and\
        increase engagement.',
    }
  ] as StoryModel[]);

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
    //this.applyTheme('dark-theme');
    this.stories$.subscribe((stories) => console.log('AppComponent constructor stories:', stories));
    this.registerSvgIcons();
  }

  toggleTheme2(event: { value: string }): void {
    const isDarkTheme = event.value === 'dark'
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    this.applyTheme(themeClass);
  }
  toggleTheme(isLight: boolean) {
    this.isLightTheme = isLight;
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  applyTheme(themeClass: string) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(themeClass);

    //this.overlayContainer.getContainerElement().classList.remove('light-theme', 'dark-theme');
    //this.overlayContainer.getContainerElement().classList.add(themeClass);
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
}
