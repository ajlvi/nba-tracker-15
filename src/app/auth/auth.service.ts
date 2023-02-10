import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "src/environments/environment.development";
import { TodayService } from "../shared/today.service";
import { User } from "./user.model";

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({providedIn: 'root'})
export class AuthService{
    //eventually will go in interceptor
    private tokenExpirationTimer: any;
    public user = new BehaviorSubject<User>(null)
    public currentEmail: string = '' //is there a reason for a getter here?

    constructor(
        private http: HttpClient, 
        private router: Router,
        private today: TodayService) {}

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIkey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(responseData => {
                this.handleAuthentication(
                    responseData.email,
                    responseData.localId,
                    responseData.idToken,
                    +responseData.expiresIn
                )
            })
        )
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIkey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(responseData => {
                this.handleAuthentication(
                    responseData.email,
                    responseData.localId,
                    responseData.idToken,
                    +responseData.expiresIn
                );
                this.today.getTodaysDate();
            })
        )
    }

    logout() {
        this.user.next(null);
        this.currentEmail = '';
        this.router.navigate(['/auth']);
        localStorage.removeItem('userdata');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer)
        }
        this.tokenExpirationTimer = null;
    }

    autoLogin() {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userdata'));

        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        )

        if (loadedUser.token) {
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            // this.autoLogout(expirationDuration);
            this.currentEmail = userData.email;
            this.user.next(loadedUser);
            this.today.getTodaysDate()
        }
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout( () => {
            this.logout()
        }, expirationDuration);
    } 

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn*1000
        );
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
        this.currentEmail = email;
        this.autoLogout(expiresIn*1000)
        localStorage.setItem('userdata', JSON.stringify(user))
    }

    private handleError(errorResponse: HttpErrorResponse) {
        let errorMessage = "Unknown error occurred :("
        if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(errorMessage);
        }
        switch (errorResponse.error.error.status) {
            case "UNAUTHENTICATED":
                errorMessage = "Invalid username/passsword."; break;
            case 'EMAIL_EXISTS':
                errorMessage = 'This e-mail address is already in use.'; break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                errorMessage = "You have tried logging in too many times; try later."; break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = "No account is associated with that e-mail address."; break;
            case "INVALID_PASSWORD":
                errorMessage = "Your password was incorrect."; break;
        }
        return throwError(errorMessage);
    }

    makePlayerDocument() {
        const write_suffix = "/projects/nba-8bb05/databases/(default)/documents:commit"; 
        const api_url = "https://firestore.googleapis.com/v1" + write_suffix;

        let docpath = "projects/nba-8bb05/databases/(default)/documents/users/" + this.currentEmail; 

        this.http.post(
            api_url, 
            {
                writes: [{"update": {"name": docpath, "fields": {}}}]
            }
        ).subscribe(() => undefined)
    }
}