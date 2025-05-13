import { Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export const RESUME_ROUTES: Routes = [
    {
        path: '',
        resolve: {
            resume: () => inject(HttpClient).get('/assets/resume.html', { responseType: 'text' })
        },
        loadComponent: () => import('./resume.component').then(m => m.ResumeComponent)
    }
]; 