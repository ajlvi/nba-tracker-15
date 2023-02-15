import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  isAuthenticated: boolean = false;
  username: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(
      (user: User) => { 
        this.isAuthenticated = !!user; 
        if (user) { this.username = user.email;}
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe;
  }

  onLogOut() {
    this.authService.logout()
  }
}
