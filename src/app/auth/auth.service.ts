import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
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
    private APIkey: string = "AIzaSyD8pB9dlWZzQHUy8oXgaL-rNsRoHAkhuUQ"
    private tokenExpirationTimer: any;
    user = new BehaviorSubject<User>(null)

    constructor(private http: HttpClient, private router: Router) {}

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + this.APIkey,
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
        );
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + this.APIkey,
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

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        // localStorage.removeItem('userdata');
        // if (this.tokenExpirationTimer) {
        //     clearTimeout(this.tokenExpirationTimer)
        // }
        // this.tokenExpirationTimer = null;
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
            this.user.next(loadedUser);
        }
    }

    //autoLogout()

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
        // this.autoLogout(expiresIn*1000)
        localStorage.setItem('userdata', JSON.stringify(user))
    }

    private handleError(errorResponse: HttpErrorResponse) {
        let errorMessage = "Unknown error occurred :("
        if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(errorMessage);
        }
        switch (errorResponse.error.error.message) {
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
}