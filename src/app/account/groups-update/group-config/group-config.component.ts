import { Component, EventEmitter, Input, Output } from '@angular/core'
import { SeenDataService } from 'src/app/shared/seen-data-service';
import { UserData } from 'src/app/shared/user-data.interface';

@Component({
  selector: 'app-group-config',
  templateUrl: './group-config.component.html',
  styleUrls: ['./group-config.component.css']
})
export class GroupConfigComponent {
  @Input() user: string;
  @Input() groupname: string;
  @Output() deleted = new EventEmitter<null>()

  roster: {[user: string]: UserData} = {};
  expanded: boolean = false;

  constructor (private seen: SeenDataService) {}

  onDelete() { this.deleted.emit() }

  onExpand() {
    this.expanded = true;
    if (!this.seen.sawGroup(this.groupname)) {
      this.seen.getGroupRoster(this.groupname).subscribe(
        () => {
          for (let user of this.seen.GroupRosters[this.groupname]) {
            this.roster[user] = this.seen.UserData[user];
          };
          console.log(this.roster);
        }
      )
    }
    else { 
      for (let user of this.seen.GroupRosters[this.groupname]) {
        this.roster[user] = this.seen.UserData[user];
      }; 
    }
  }

  onContract() {
    this.expanded = false;
  }

}
