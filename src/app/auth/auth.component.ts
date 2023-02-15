import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLoading: boolean = false;
  isLoginMode: boolean = true;
  error: string = null;

  constructor(
    private router: Router,
    private authService: AuthService) {}

  onToggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<AuthResponseData>

    this.isLoading = true;
    if (this.isLoginMode) {
      authObs = this.authService.login(email, password)
    }
    else {
      authObs = this.authService.signup(email, password)
    }

    authObs.subscribe(
      respData => {
        console.log(respData);
        if (!this.isLoginMode) {
          this.authService.makePlayerDocument()
        }
        this.isLoading = false;
        this.router.navigate(['/make-picks']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    )
  }

  onHandleError() {this.error = null;}
}
