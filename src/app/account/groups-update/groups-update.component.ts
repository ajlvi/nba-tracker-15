import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SeenDataService } from 'src/app/shared/seen-data-service';
import { UserData } from 'src/app/shared/user-data.interface';

@Component({
  selector: 'app-groups-update',
  templateUrl: './groups-update.component.html',
  styleUrls: ['./groups-update.component.css']
})
export class GroupsUpdateComponent {
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
      this.padGroups();
    }
    else {
      this.seen.getUserData(email).subscribe(
        () => {
          this.groupNames = this.seen.UserData[email]["groups"]
          this.padGroups();
        }
      )
    }
  }

  onAddGroup() {
    if (this.groupNames.length < 5) {
      this.groupNames.push('');
    }
  }

  onClearGroup(i: number) {
    this.groupNames = this.groupNames.slice(0, i).concat(this.groupNames.slice(i+1));
  }

  padGroups() {
    if (this.groupNames.length == 0) {this.onAddGroup();}
  }

  onUpdateGroups(groupForm: NgForm) {
    let proceed = true;
    let input_names = [];
    for (let group in groupForm.form.value) {
      const groupname = groupForm.form.value[group];
      input_names.push(groupname)
      if (groupname.length <= 2) { 
        proceed = false; 
        this.error = "Remove or replace groups with fewer than three characters before updating."}
    }
    if (proceed) {
      this.seen.setGroups(this.username, input_names).subscribe(
        () => { 
          this.successfulChange = true; 
          this.groupNames = input_names;
        }
      )
    }
  }

}
