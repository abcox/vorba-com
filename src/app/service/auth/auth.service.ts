import { inject, Injectable, signal } from '@angular/core';
import { AuthService as AuthApiService } from '@file-service-api/v1';
import { map, Observable } from 'rxjs';
import { TOKEN_KEY } from '../../app.config';

// TODO: define the types for the request and response in the API model
// so we have them on generating the API module
export interface RegisterRequest {
    email: string;
    name: string;
}

export interface RegisterResponse {
    message: string;
    success: boolean;
    token: string;
    user: any; // TODO: define the type
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private authApiService = inject(AuthApiService);
    private authState = signal<RegisterResponse | null>(null);

    // TODO:
    // 1. manage the token by saving it in storage (local / session)
    // 2. navigate to the quiz page
    // 3. API: create /quiz/submit, so that we can persist the user's quiz input
    // 4. after, quiz submit, go to the file upload
    // 5. generate the report and deliver via response to file upload (perhaps we need an endpoint like /report/generate)
    // 6. provide user abilit to download the report
    // 7. schedule a follow up email to the user (thanks for taking our quiz -->  what did you think about your personalized report ?)
    register(request: { email: string, name: string }): Observable<boolean> {
        return this.authApiService.authControllerRegister(request).pipe(
            map((response) => {
                console.log('register response', response);
                if (!response.success) {
                    this.clearAuthState();
                    return false;
                }
                // Store the token in localStorage
                //localStorage.setItem(TOKEN_KEY, response.token);
                this.authState.set(response);
                return true;
            })
        );
    }

    getToken(): string | null {
        return this.authState()?.token ?? null;
    }
    
    clearAuthState(): void {
        this.authState.set(null);
    }

    /* getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    clearAuthState(): void {
        localStorage.removeItem(TOKEN_KEY);
        this.authState.set(null);
    }

    logout(): void {
        this.clearAuthState();
    } */
}
