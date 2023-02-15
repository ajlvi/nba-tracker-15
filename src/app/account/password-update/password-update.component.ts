import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.css']
})
export class PasswordUpdateComponent {
  isLoading: boolean = false;
  successfulChange: boolean = false;
  userSub: Subscription;
  username: string;
  error: string = null;

  constructor (private auth: AuthService) {}

  ngOnInit() {
    this.userSub = this.auth.user.subscribe(
      user => {
        if (user) {
          this.username = user.email;
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe()
  }

  onPasswordChange(form: NgForm) {
    const oldpass = form.value.oldpass;
    const newpass1 = form.value.newpass1;
    const newpass2 = form.value.newpass2;

    if (newpass1 === newpass2) {
      this.auth.change_password(this.username, oldpass, newpass2).subscribe(
        () => {
          this.isLoading = false;
          this.error = '';
          this.successfulChange = true;
          form.reset();
        },
        errorMessage => {
          console.log(errorMessage);
          this.error = errorMessage;
          this.isLoading = false;
        })
      }
    }
}
