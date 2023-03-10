export class Game {
    constructor(
        public fav: string, 
        public line: string, 
        public dog: string, 
        public home: string,
        public score: string,  
        public ats_win: string,
        public time: number,
    ) {}
}

export class RecordData {
    constructor(
        public user: string,
        public wins: number, 
        public losses: number, 
        public ties: number) {}
}