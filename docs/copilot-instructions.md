# Copilot Instructions for VorbaWeb

## Architecture Overview

**VorbaWeb** is an Angular 18 standalone application combining:
- **Frontend**: Angular 18+ with Material Design 3, PrimeNG, Tailwind CSS
- **Backend Integration**: Two auto-generated OpenAPI clients (`backend-api/v1` and `file-service-api/v1`)
- **Deployment**: Azure App Service with PowerShell automation (`scripts/deploy/deploy.ps1`)
- **UX Testing**: Puppeteer-based automated UX analysis with MCP feedback loops

## Key Development Patterns

### Standalone Components
All components use Angular's standalone pattern with explicit imports:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MatButtonModule, /* ... */],
  // ...
})
```

### API Integration Architecture
- **Two separate API clients**: `@backend-api/v1` and `@file-service-api/v1`
- **Configuration**: Use factory functions in `src/app/core/services/api-config.service.ts`
- **Environment-based**: Base URLs configured in `src/environments/environment.ts`
- **Module imports**: Both API modules imported in `app.config.ts` with `importProvidersFrom()`

### Theme System
- **Material Design 3**: Custom theme in `src/themes/m3-theme.scss`
- **Dual theming**: Light/dark themes with Tailwind CSS (`darkMode: 'class'`)
- **Theme service**: `src/app/services/theme.service.ts` with signals
- **Layout service**: `src/app/component/layout/_service/layout.service.ts` for drawer state

### Component Organization
```
src/app/component/
├── carousel/          # Custom carousel component
├── dialog/           # Reusable dialog components with service
├── layout/           # Header, footer, nav with layout service
├── page/             # Page-level components (home, contact, etc.)
└── profile-card/     # Specialized UI components
```

## Critical Development Workflows

### Build & Deployment
- **Development**: `npm run start:dev` (ng serve)
- **Production build**: `npm run build:prod`
- **Azure deployment**: `npm run deploy` (PowerShell script)
- **Custom server.js**: Express server for production SPA routing

### API Code Generation
```bash
# Backend API (local dev)
npm run openapi-gen-v1

# Backend API (production)
npm run openapi-gen-v1-prod

# File Service API
npm run openapi-gen-file-service-v1
```

### UX Testing System
- **Full UX audit**: `npm run ux:audit`
- **URL analysis**: `npm run ux:analyze-url <url>`
- **MCP feedback loop**: `npm run ux:example`
- **Results**: Saved to `ux-analysis-results/` with HTML reports and screenshots

### Testing
- **Unit tests**: `npm run test` (Karma + Jasmine)
- **CI tests**: `npm run test:ci` (headless Chrome)
- **Linting**: `npm run lint` (ESLint + Stylelint)

## Project-Specific Conventions

### Service Injection Pattern
Use `inject()` function in components, not constructor DI:
```typescript
export class ExampleComponent {
  private dialogService = inject(DialogService);
  private layoutService = inject(LayoutService);
}
```

### Dialog Pattern
All dialogs use the centralized `DialogService`:
```typescript
// Use typed dialog methods
this.dialogService.openLoginDialog(data);
// Or generic method for custom dialogs
this.dialogService.openDialog(CustomComponent, data, config);
```

### Layout State Management
- **Drawer control**: Use `LayoutService` for sidenav state
- **Theme switching**: Use `ThemeService` with signals
- **Title management**: `layoutService.setTitlePrefix()` for page titles

### Authentication Flow
- **Auth guard**: `src/app/core/auth/auth.guard.ts` protects admin routes
- **Session service**: `src/app/core/session/session.service.ts` with idle detection
- **Interceptor**: `src/app/core/interceptors/auth.interceptor.ts` adds Bearer tokens

## File Structure Conventions

### Generated API Code
- **Never edit**: Files in `src/backend-api/v1/` and `src/file-service-api/v1/` are auto-generated
- **Custom logic**: Place in `src/app/core/services/` or component-specific services

### Styling Approach
- **Component styles**: Use `.scss` files alongside components
- **Global themes**: Material theme variables in `src/themes/`
- **Utility classes**: Tailwind for layout and spacing
- **Custom variables**: CSS custom properties in theme files

### Environment Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  backendApiUrl: 'http://localhost:3000/api',
  fileServiceApiUrl: 'http://localhost:3000'
};
```

## Integration Points

### External Dependencies
- **YouTube Player**: `@angular/youtube-player` for video embeds
- **PDF Viewer**: `ngx-extended-pdf-viewer` with asset configuration
- **Swiper**: For carousel functionality with touch support
- **Ng-Idle**: Session timeout and keepalive functionality

### Azure Deployment
- **App Service**: Linux container with Node.js 22 LTS
- **Custom domains**: Multiple domains configured in deployment script
- **SSL/HTTPS**: Automated certificate management
- **Startup command**: `node server.js` for SPA routing

### UX Analysis Pipeline
- **Puppeteer**: Automated browser testing and screenshot capture
- **MCP Integration**: Model Context Protocol for AI-driven UX feedback
- **Performance metrics**: Core Web Vitals and accessibility scoring
- **Continuous monitoring**: Before/after comparison and regression detection

## Common Patterns to Follow

1. **Components**: Always standalone with explicit imports
2. **Services**: Use `providedIn: 'root'` and `inject()` pattern  
3. **Routing**: Lazy-loaded feature modules in `app.routes.ts`
4. **State**: Signals for reactive state, RxJS for async operations
5. **Styling**: Component-scoped SCSS + Tailwind utilities
6. **APIs**: Use generated clients, configure via factories
7. **Testing**: Include UX analysis in development workflow