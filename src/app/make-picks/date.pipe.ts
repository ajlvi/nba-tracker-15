import { Pipe, PipeTransform } from "@angular/core";

@Pipe({'name': 'DateExpand'})
export class DateExpandPipe implements PipeTransform {
    public montharray = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    transform(value: string): string {
        let monthnum = parseInt(value.slice(0,2))
        if (monthnum >= 13) {monthnum = monthnum - 12}
        let datenum = parseInt(value.slice(2))
        return this.montharray[monthnum - 1] + " " + datenum;
    }
}