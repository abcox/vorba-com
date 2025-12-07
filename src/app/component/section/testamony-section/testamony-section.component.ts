import { Component, signal } from '@angular/core';

interface TestamonyItem {
  html: string;
}

@Component({
  selector: 'app-testamony-section',
  standalone: true,
  imports: [],
  template: `
    <section class="testamony-section">
        <h2>Testimonials</h2>
        <div class="container">
            @for (item of items(); track item) {
                <div class="testamony-item" key={item.html}>
                    <p>{{ item.html }}</p>
                </div>
            }
        </div>
    </section>
  `,
    styles: [`
        .testamony-section {
            margin: 0 auto;
            padding: 0 1rem;
        }

        .testamony-item {
            margin-bottom: 1.5rem;
            font-style: italic;
            padding: 1rem;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    
        .container {
            display: flex;
            flex-direction: row;
            //flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            //padding: 1rem 0;
        }
    `]
})
export class TestamonySectionComponent {
    items = signal<TestamonyItem[]>([
        {
            html: `“When you need someone who can step into complex systems, make
                sense of them fast, and deliver results that strengthen your entire
                product, Adam is that engineer.” — Director, Product Development, Dayforce`,
        },
        {
            html: `“Adam combines deep technical strength with natural leadership. He elevates
            teams, improves architecture, mentors developers, and produces consistently outstanding
            results. Any organization would benefit from his expertise.” — Director, Product Development, Dayforce`
        }
    ])
}