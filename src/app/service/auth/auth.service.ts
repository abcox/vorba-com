import { inject, Injectable, signal } from '@angular/core';
import { AuthService as AuthApiService } from '@file-service-api/v1';
import { map, Observable } from 'rxjs';

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
                    return false;
                }
                // TODO: store the token in the local storage
                //localStorage.setItem('token', response.token);
                this.authState.set(response);
                return true;
            })
        );
    }
}
