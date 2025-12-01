import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  features: string[];
  technologies?: string[];
  icon?: string;
}

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  services: ServiceItem[];
}

@Component({
  selector: 'app-service-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './service-page.component.html',
  styleUrl: './service-page.component.scss'
})
export class ServicePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  serviceCategories = signal<ServiceCategory[]>([
    {
      id: 'modernize',
      title: 'Modernize',
      description: 'Transform your legacy systems into modern, scalable solutions',
      services: [
        {
          id: 'legacy-renewal',
          title: 'Legacy Renewal',
          description: 'Breathe new life into your existing systems with modern technologies and architectures.',
          features: [
            'Code refactoring and optimization',
            'Technology stack upgrades', 
            'Performance improvements',
            'Security enhancements'
          ],
          technologies: ['Angular', 'React', '.NET Core', 'Node.js'],
          icon: 'refresh'
        },
        {
          id: 'system-migration',
          title: 'System Migration',
          description: 'Seamlessly migrate your applications to modern platforms and cloud infrastructure.',
          features: [
            'Cloud migration strategies',
            'Database modernization',
            'Zero-downtime deployments',
            'Data integrity assurance'
          ],
          technologies: ['Azure', 'AWS', 'Docker', 'Kubernetes'],
          icon: 'cloud_upload'
        },
        {
          id: 'systems-integration',
          title: 'Systems Integration',
          description: 'Connect disparate systems for seamless data flow and improved efficiency.',
          features: [
            'API development and integration',
            'Microservices architecture',
            'Event-driven systems',
            'Real-time data synchronization'
          ],
          technologies: ['REST APIs', 'GraphQL', 'Service Bus', 'Event Grid'],
          icon: 'hub'
        },
        {
          id: 'code-reviews',
          title: 'Code Reviews',
          description: 'Comprehensive analysis of your codebase to identify improvements and best practices.',
          features: [
            'Security vulnerability assessment',
            'Performance bottleneck identification',
            'Code quality metrics',
            'Best practices recommendations'
          ],
          technologies: ['SonarQube', 'ESLint', 'CodeQL', 'Custom Tools'],
          icon: 'code'
        }
      ]
    },
    {
      id: 'develop',
      title: 'Develop',
      description: 'Build robust, scalable solutions tailored to your business needs',
      services: [
        {
          id: 'business-analysis',
          title: 'Business Analysis',
          description: 'Deep dive into your business requirements to design optimal technical solutions.',
          features: [
            'Requirements gathering and documentation',
            'Process mapping and optimization',
            'Stakeholder interviews and workshops',
            'Technical feasibility analysis'
          ],
          icon: 'analytics'
        },
        {
          id: 'systems-analysis',
          title: 'Systems Analysis',
          description: 'Comprehensive evaluation of your current systems and infrastructure.',
          features: [
            'Current state assessment',
            'Gap analysis and recommendations',
            'Integration points identification',
            'Risk assessment and mitigation'
          ],
          icon: 'assessment'
        },
        {
          id: 'systems-architecture',
          title: 'System Architecture',
          description: 'Design scalable, maintainable architectures that support your business goals.',
          features: [
            'Solution architecture design',
            'Technology stack selection',
            'Scalability planning',
            'Documentation and blueprints'
          ],
          technologies: ['Microservices', 'Event-Driven', 'Cloud-Native', 'Domain-Driven Design'],
          icon: 'account_tree'
        },
        {
          id: 'performance-optimization',
          title: 'Performance Optimization',
          description: 'Optimize your applications for speed, efficiency, and user experience.',
          features: [
            'Performance profiling and analysis',
            'Database query optimization',
            'Caching strategies implementation',
            'Load testing and monitoring'
          ],
          technologies: ['Redis', 'CDN', 'Load Balancers', 'Application Insights'],
          icon: 'speed'
        },
        {
          id: 'security-audits',
          title: 'Security Audits',
          description: 'Comprehensive security assessment to protect your digital assets.',
          features: [
            'Vulnerability scanning and assessment',
            'Penetration testing',
            'Security best practices review',
            'Compliance verification'
          ],
          technologies: ['OWASP', 'Security Frameworks', 'Compliance Tools'],
          icon: 'security'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Ongoing support to ensure your systems run smoothly and your team succeeds',
      services: [
        {
          id: 'backlog-management',
          title: 'Backlog Management',
          description: 'Strategic planning and prioritization of your development initiatives.',
          features: [
            'Feature prioritization frameworks',
            'Sprint planning assistance',
            'Story mapping workshops',
            'Roadmap development'
          ],
          icon: 'list_alt'
        },
        {
          id: 'documentation',
          title: 'Documentation',
          description: 'Comprehensive documentation to support development and maintenance.',
          features: [
            'Technical documentation creation',
            'API documentation',
            'User guides and tutorials',
            'Knowledge base development'
          ],
          icon: 'description'
        },
        {
          id: 'maintenance',
          title: 'Maintenance',
          description: 'Ongoing support to keep your systems updated and running optimally.',
          features: [
            'Regular updates and patches',
            'Bug fixes and troubleshooting',
            'Performance monitoring',
            'Preventive maintenance'
          ],
          icon: 'build'
        },
        {
          id: 'training',
          title: 'Training',
          description: 'Empower your team with the skills and knowledge they need to succeed.',
          features: [
            'Technology-specific training programs',
            'Best practices workshops',
            'Mentoring and coaching',
            'Custom curriculum development'
          ],
          icon: 'school'
        },
        {
          id: 'talent-growth',
          title: 'Talent Growth',
          description: 'Develop your team\'s capabilities and advance their careers.',
          features: [
            'Individual development plans',
            'Skill assessment and gap analysis',
            'Career path guidance',
            'Leadership development'
          ],
          icon: 'trending_up'
        }
      ]
    }
  ]);

  ngOnInit(): void {
    // Handle fragment navigation (anchor links)
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    });
  }

  navigateToService(categoryId: string, serviceId: string): void {
    this.router.navigate([], {
      fragment: `${categoryId}-${serviceId}`,
      relativeTo: this.route
    });
  }

  getQuote(): void {
    this.router.navigate(['/contact']);
  }
}