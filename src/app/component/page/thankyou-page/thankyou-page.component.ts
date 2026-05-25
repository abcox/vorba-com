import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-thankyou-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './thankyou-page.component.html',
  styleUrl: './thankyou-page.component.scss',
})
export class ThankyouPageComponent {
  private route = inject(ActivatedRoute);
  private queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  name = computed(
    () => this.queryParamMap().get('name') ?? this.paramMap().get('name') ?? undefined,
  );

  message = computed(
    () =>
      this.queryParamMap().get('message') ??
      this.paramMap().get('message') ??
      'Thank you for your time!',
  );

  title = computed(() => (this.name() ? `Thank you, ${this.name()}!` : 'Thank you!'));
}
