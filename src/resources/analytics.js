export class Analytics {
    constructor(num_words, quote, start_time) {
        this.average_word = quote.length/num_words;
        this.start_time = start_time;
    }
    wpm(green_length, time) {
        let wpm = 60000*(green_length/this.average_word)/(time - this.start_time);
        return Math.floor(wpm);
    }
}