import { Pipe, PipeTransform } from "@angular/core";

@Pipe({'name': 'ExcludeUser'})
export class ExcludeUserPipe implements PipeTransform {
    transform(value: string[], to_omit: string): string[] {
        let output = []
        for (let user of value) {
            if (user !== to_omit) { output.push(user) }
        }
        return output;
    }
}