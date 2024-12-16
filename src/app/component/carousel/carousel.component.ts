import { AfterViewInit, Component, ContentChildren, OnInit, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, AfterViewInit {
  @ContentChildren(TemplateRef) slides!: QueryList<TemplateRef<any>>;
  validSlides: TemplateRef<any>[] = [];
  activeSlideIndex: number = 1;

  constructor() {
  }

  ngAfterContentInit(): void {
    // Convert QueryList to array and exclude first and last templates
    const allSlides = this.slides.toArray();
    console.log('ngAfterContentInit allSlides:', allSlides); // Debug the filtered slides
    this.validSlides = allSlides.slice(1, allSlides.length); // Remove first and last templates
    console.log('ngAfterContentInit validSlides:', this.validSlides); // Debug the filtered slides
  }

  ngAfterViewInit(): void {
    //throw new Error('Method not implemented.');
    //console.log('ngAfterViewInit slides:', this.slides);
  }

  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    console.log('ngOnInit slides:', this.slides);
  }

  prevSlide(): void {
    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex--;
    }
  }

  nextSlide(): void {
    if (this.activeSlideIndex < this.slides.length - 1) {
      this.activeSlideIndex++;
    }
  }

  goToSlide(index: number): void {
    this.activeSlideIndex = index;
  }
}
