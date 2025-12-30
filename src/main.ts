import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';

import { App } from './app/app';
import { routes } from './app/app.routes';

void bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient(), provideMarkdown()],
});
