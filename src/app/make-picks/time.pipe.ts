import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform(value: number): string {
        const time = new Date(+value)
        let hours = (time.getHours() - 12).toString() + ":" 
        let minutes = "0" + time.getMinutes().toString()
        return hours + minutes.slice(-2)
    }
}