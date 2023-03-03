import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SeenDataService } from 'src/app/shared/seen-data.service';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.css']
})
export class AddGroupComponent {
  @Input() user: string;
  @Output('groupAdded') groupEmitter = new EventEmitter<string>();
  error: string = '';

  constructor(private seen: SeenDataService) {}

  onAddGroup(f: NgForm) {
    this.error = '';
    const newGroup = f.form.value.newGroup;
    if (newGroup in this.seen.GroupRosters) { 
      this.decideAcceptance(newGroup) 
      f.reset()
    }
    else {
      this.seen.getGroupRoster(newGroup).subscribe(
        () => { 
          this.decideAcceptance(newGroup); 
          f.reset()
        }
      )
    }
  }

  decideAcceptance(newGroup: string) {
    if (this.seen.GroupRosters[newGroup].length >= 10) {
      this.error = "This group has 10 members."
    }
    else if ( this.seen.GroupRosters[newGroup].includes(this.user) ) {
      this.error = "You're already in this group."
    }
    else {
      this.groupEmitter.emit(newGroup);
    }
  }
}
