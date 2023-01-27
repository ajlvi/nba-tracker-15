export class Game {
    fav: string;
    line: string;
    dog: string;
    home: string;
    score: string; 
    ats_win: string;
    time: string;

    constructor(
        fav: string, 
        line: string, 
        dog: string, 
        home: string,
        score: string,  
        ats_win: string,
        time: string,
    ) {
        this.fav = fav;
        this.line = line;
        this.dog = dog;
        this.home = home;
        this.score = score;
        this.ats_win = ats_win;
        this.time = time;
    }
}