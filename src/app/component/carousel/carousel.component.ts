import { AfterViewInit, Component, ContentChildren, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input, Input, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import SwiperCore from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { register as registerSwiperElements } from 'swiper/element/bundle';
//import { AutoplayOptions, SwiperOptions } from 'swiper/types';

/* 
 *  Wrapper for https://swiperjs.com/
 */

export interface CarouselAutoplayOptions {
  delayMs: number;
  disableOnInteraction: boolean;
  pauseOnMouseEnter: boolean;
  stopOnLastSlide: boolean;
  reverseDirection: boolean;
  waitForTransition: boolean;
}

export interface CarouselOptions {
  autoplay?: CarouselAutoplayOptions;
  navigation?: boolean;
  showAutoplayProgress?: boolean;
}

registerSwiperElements();

export const DEFAULT_CAROUSEL_AUTOPLAY_OPTIONS: CarouselAutoplayOptions = {
  delayMs: 10000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
  stopOnLastSlide: false,
  reverseDirection: false,
  waitForTransition: true
};

const DEFAULT_CAROUSEL_OPTIONS = {
  autoplay: undefined /* {
    delayMs: 10000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
        stopOnLastSlide: false,
        reverseDirection: false,
        waitForTransition: true
  } */,
  navigation: true,
  showAutoplayProgress: true,
};

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarouselComponent implements AfterViewInit {
  @ContentChildren('slide') slides!: QueryList<TemplateRef<any>>;
  @ViewChild('swiper') swiperRef: ElementRef<HTMLElement & { swiper?: SwiperCore } & { initialize: () => void }> | undefined;

  options = input<CarouselOptions, Partial<CarouselOptions>>(
    DEFAULT_CAROUSEL_OPTIONS, {
    transform: (value: Partial<CarouselOptions>) => ({
      ...DEFAULT_CAROUSEL_OPTIONS,
      ...value
    })
  });

  swiper?: SwiperCore;

  ngAfterViewInit(): void {
    const options = this.options();
    const { navigation, autoplay } = options;
    const progressCircle = document.querySelector<HTMLElement>(".autoplay-progress svg");
    const progressContent = document.querySelector<HTMLElement>(".autoplay-progress span");
    const swiperEl = Object.assign(this.swiperRef!.nativeElement, {
      modules: [ Autoplay, Navigation, Pagination ],
      autoplay: autoplay ? { ...autoplay, delay: autoplay?.delayMs ?? 10000 } : undefined,
      loop: true, // not having this here will cause next page button to skip to last page?
      navigation,
      pagination: {
        clickable: true,
        //el: '.custom-pagination', // Use your own element
      },
      speed: 1000,
      on: {
        init: () => {
          console.log('Swiper initialized');
        },
        // https://codesandbox.io/p/sandbox/9q8l47?file=%2Findex.html%3A129%2C46-131%2C70
        autoplayTimeLeft: (s: any, time: any, progress: any) => {
          //console.log('Swiper autoplay time left:', s, time, progress);
          if (!this.options().showAutoplayProgress ||
              !(progressCircle && progressContent)) {
            return;
          }
          progressCircle.style.setProperty("--progress", (1 - progress).toString());
          progressContent.textContent = `${Math.ceil(time / 1000)}s`;
        }
      }
    });
    swiperEl.initialize();
    this.swiper = this.swiperRef!.nativeElement.swiper;
    
    // Apply styles after Swiper loads
    /* setTimeout(() => {
      const pagination = this.swiperRef?.nativeElement.querySelector('.swiper-pagination');
      console.log('pagination element:', pagination);
      if (pagination) {
        (pagination as HTMLElement).style.position = 'unset';
      }
    }, 0); */
    // Force style after initialization
    setTimeout(() => {
      const swiperContainer = this.swiperRef?.nativeElement;
      const pagination = swiperContainer?.shadowRoot?.querySelector('.swiper-pagination') ||
                        swiperContainer?.querySelector('.swiper-pagination');
      
      if (pagination) {
        (pagination as HTMLElement).style.setProperty('position', 'unset', 'important');
      }
    }, 100);
  }
}
