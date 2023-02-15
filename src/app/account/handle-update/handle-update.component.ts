import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SeenDataService } from 'src/app/shared/seen-data-service';
import { UserData } from 'src/app/shared/user-data.interface';

@Component({
  selector: 'app-handle-update',
  templateUrl: './handle-update.component.html',
  styleUrls: ['./handle-update.component.css']
})
export class HandleUpdateComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  username: string;
  displayName: string;
  isLoading: boolean = false;
  successfulChange: boolean = false;
  
  constructor (private auth: AuthService, private seen: SeenDataService) {}
  
  ngOnInit() {
    this.isLoading = true;
    this.userSub = this.auth.user.subscribe(
      user => {
        if (user) {
          this.username = user.email;
          this.getCurrentHandle(this.username);
          this.isLoading = false;
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  getCurrentHandle(email: string) {
    if (this.seen.sawUser(email)) {
      this.displayName = this.seen.UserData[email].handle;
    }
    else {
      this.seen.getUserData(email).subscribe(
        (response: UserData) => {
          this.displayName = response.handle;
        }
      )
    }
  }

  onChangeHandle(form: NgForm) {
    const newHandle = form.value.handle
    this.seen.setHandle(this.username, newHandle).subscribe(
      () => {
        this.displayName = newHandle;
        this.successfulChange = true;
      }
    )
  }
}
