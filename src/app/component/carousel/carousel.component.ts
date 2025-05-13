import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, OnInit, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import SwiperCore from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

/* 
 *  Wrapper for https://swiperjs.com/
 */

registerSwiperElements();

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
  @Input() autoplayDelayMs = 60000;
  @ViewChild('swiper') swiperRef: ElementRef<HTMLElement & { swiper?: SwiperCore } & { initialize: () => void }> | undefined;

  swiper?: SwiperCore;

  ngAfterViewInit(): void {
    const progressCircle = document.querySelector<HTMLElement>(".autoplay-progress svg");
    const progressContent = document.querySelector<HTMLElement>(".autoplay-progress span");
    const swiperEl = Object.assign(this.swiperRef!.nativeElement, {
      modules: [ Autoplay, Navigation, Pagination ],
      autoplay: {
        delay: this.autoplayDelayMs,
        disableOnInteraction: false,
      },
      loop: true, // not having this here will cause next page button to skip to last page?
      navigation: true,
      pagination: {
        clickable: true,
      },
      on: {
        init: () => {
          console.log('Swiper initialized');
        },
        // https://codesandbox.io/p/sandbox/9q8l47?file=%2Findex.html%3A129%2C46-131%2C70
        autoplayTimeLeft: (s: any, time: any, progress: any) => {
          //console.log('Swiper autoplay time left:', s, time, progress);
          progressCircle!.style.setProperty("--progress", (1 - progress).toString());
          progressContent!.textContent = `${Math.ceil(time / 1000)}s`;
        }
      }
    });
    swiperEl.initialize();
    this.swiper = this.swiperRef!.nativeElement.swiper;
  }
}
