import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { appRoutes } from './app.routes';

// Angular Animations
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// PrimeNG
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),

    // Angular animations (async version is lighter)
    provideAnimationsAsync(),

    // PrimeNG global config
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
