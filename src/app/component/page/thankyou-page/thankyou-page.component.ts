import { CommonModule } from '@angular/common';
import { Component, Input, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-thankyou-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './thankyou-page.component.html',
  styleUrl: './thankyou-page.component.scss',
})
export class ThankyouPageComponent {
  @Input() message? = 'Thank you for your time!';
  name = input<string | undefined>(undefined);
  title = computed(() => this.name() ? `Thank you, ${this.name()}!` : 'Thank you!');
}
