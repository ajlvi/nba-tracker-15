import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-group-config',
  templateUrl: './group-config.component.html',
  styleUrls: ['./group-config.component.css']
})
export class GroupConfigComponent {
  @Input() user: string;
  @Input() groupname: string;
  @Output() deleted = new EventEmitter<null>()

  onDelete() { this.deleted.emit() }
}
