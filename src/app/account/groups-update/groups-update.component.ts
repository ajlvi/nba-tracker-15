import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SeenDataService } from 'src/app/shared/seen-data.service';

@Component({
  selector: 'app-groups-update',
  templateUrl: './groups-update.component.html',
  styleUrls: ['./groups-update.component.css']
})
export class GroupsUpdateComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  username: string;
  groupNames: string[] = [];
  isLoading: boolean = false;
  successfulChange: boolean = false;
  error: string = '';
  
  constructor (private auth: AuthService, private seen: SeenDataService) {}
  
  ngOnInit() {
    this.isLoading = true;
    this.userSub = this.auth.user.subscribe(
      user => {
        if (user) {
          this.username = user.email;
          this.getCurrentGroups(this.username);
          this.isLoading = false;
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  getCurrentGroups(email: string) {
    if (this.seen.sawUser(email)) {
      this.groupNames = this.seen.UserData[email].groups;
    }
    else {
      this.seen.getUserData(email).subscribe(
        () => {
          this.groupNames = this.seen.UserData[email]["groups"]
        }
      )
    }
  }

  onAddGroup(newGroupName: string) {
    let newGroupNames = this.groupNames.slice()
    newGroupNames.push(newGroupName)
    this.seen.setGroups(this.username, newGroupNames).subscribe(
      () => {
        this.successfulChange = true;
        this.groupNames = newGroupNames;
      }
    )
  }

  onDelete(group) {
    let groupidx = this.groupNames.indexOf(group)
    let newGroupNames = this.groupNames.slice(0, groupidx).concat(this.groupNames.slice(groupidx+1));
    this.seen.setGroups(this.username, newGroupNames).subscribe(
      () => {
        this.successfulChange = true;
        this.groupNames = newGroupNames;
      }
    )
  }
}
