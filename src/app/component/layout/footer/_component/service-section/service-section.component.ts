import { Component, signal } from "@angular/core";

@Component({
    selector: 'app-service-section',
    standalone: true,
    imports: [],
    templateUrl: './service-section.component.html',
    styleUrl: './service-section.component.scss'
})
export class ServiceSectionComponent {
    currentYear = signal(new Date().getFullYear());
    service = signal({
        title: 'Our Services',
        description: 'We specialize in delivering custom software solutions that drive business success. Our services include:',
        list: [
            { 
                title: 'Disciplines', 
                links: [
                    { label: 'Full-Stack Development', url: '/services/full-stack-development' },
                    { label: 'Cloud Computing & DevOps', url: '/services/cloud-devops' },
                    { label: 'Legacy System Modernization', url: '/services/legacy-modernization' },
                    { label: 'Agile Consulting & Team Leadership', url: '/services/agile-consulting' }
                ]
            },
            { 
                title: 'Industries', 
                links: [
                    { label: 'Government & Public Sector', url: '/industries/government' },
                    { label: 'Finance & Banking', url: '/industries/finance' },
                    { label: 'Healthcare & Life Sciences', url: '/industries/healthcare' },
                    { label: 'Education & E-Learning', url: '/industries/education' }
                ]
            },
            { 
                title: 'Technologies', 
                links: [
                    { label: 'JavaScript/TypeScript (Angular, React, Node.js)', url: '/technologies/javascript' },
                    { label: 'Python (Django, Flask)', url: '/technologies/python' },
                    { label: 'Cloud Platforms (AWS, Azure, GCP)', url: '/technologies/cloud' },
                    { label: 'Containerization & Orchestration (Docker, Kubernetes)', url: '/technologies/containers' }
                ]
            },
            { 
                title: 'Planning', 
                links: [
                    { label: 'System Assessment & Strategy', url: '/services/system-assessment' },
                    { label: 'Incremental Modernization', url: '/services/incremental-modernization' },
                    { label: 'Data Migration & Integration', url: '/services/data-migration' },
                    { label: 'Performance Optimization', url: '/services/performance-optimization' }
                ]
            },
            { 
                title: 'Leadership', 
                links: [
                    { label: 'Technical Team Leadership', url: '/services/team-leadership' },
                    { label: 'Agile Coaching & Mentorship', url: '/services/agile-coaching' },
                    { label: 'Project Management', url: '/services/project-management' },
                    { label: 'Stakeholder Communication', url: '/services/stakeholder-communication' }
                ]
            },
            { 
                title: 'Case Studies', 
                links: [
                    { label: 'Government System Modernization', url: '/case-studies/government-modernization' },
                    { label: 'Financial Platform Overhaul', url: '/case-studies/financial-platform' },
                    { label: 'Healthcare System Integration', url: '/case-studies/healthcare-integration' },
                    { label: 'Education Portal Development', url: '/case-studies/education-portal' }
                ]
            }
        ]
    });
}