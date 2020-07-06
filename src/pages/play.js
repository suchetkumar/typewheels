import {HttpClient} from 'aurelia-fetch-client';
import 'bootstrap';
import {Analytics} from '../resources/analytics';
import Highcharts from 'highcharts'
require ('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);


let client = new HttpClient();


export class App {
  constructor() {
    this.exactly = false;
    this.loaded = false;
    this.completed = false;
    this.focus = false;

    this.get();

    // compute stuff on keydowns
    this.eventListener = (e) => {
      setTimeout(() => {
        if (!this.completed) {   
          this.refreshGrading(e);
        }
        if (this.completed && e.keyCode==13) {
          this.get();
        }
      }, 0);
    }

    // compute analytics every 500 ms
    setInterval(() => {
      if (!this.completed) {
        this.refreshGrading();
        this.displayWPM();
        }
      }, 500);
  }

  // get quote and reset
  get() {
    this.loaded = false;
    this.completed = false;
    client.fetch('https://api.quotable.io/random')
     .then(response => response.json())
     .then(data => {
      this.quote = `${data.content} - ${data.author}`;
      this.words = this.quote.split(" ");
      this.loaded = true; 
      this.reset();
      this.ready();
    });
  }

  attached() {
    var input = document.getElementById('inp');
    input.addEventListener('keydown', this.eventListener);
  }

  reset() {
    this.current = 0;
    this.green = "";
    this.red = "";
    this.typed = "";
    this.regular = this.quote;
    this.startTime = new Date();
    this.analytics = new Analytics(this.words.length, this.quote, this.startTime);
    this.wpm = 0;
    this.display = 0;
    this.render();
  }

  // for debugging
  showThis() {
    console.log(this);
  }

  refreshGrading(e) {
    // check if we need to move to next word
    this.correct = "";
    var currentWord = this.words[this.current];
    
    if (e != undefined) {
      if (this.exactly && e.key == " " && this.typed.length == currentWord.length+1) {
        this.typed = "";
        this.current += 1;
        this.exactly = false;
      }
    }

    // check correctly inputted characters if word length not achieved
    if (currentWord.length >= this.typed.length) {
      for (let i=0; i<this.typed.length; i++) {
        if (currentWord[i] == this.typed[i]) {
          this.correct += this.typed[i];
        }
        else {break;}
      }
      if (this.typed == currentWord) {
        this.exactly = true;
        if (this.current == this.words.length-1) {
          //user is done with the race
          //proceed to show stats in a popup
          this.completed = true;
        }
      } 
    } 

    if (currentWord.length < this.typed.length) {
      //check correctly inputted characters if over word length
      for (let i=0; i<currentWord.length; i++) {
        if (currentWord[i] == this.typed[i]) {
          this.correct += this.typed[i];
        }
        else {break;}
      }
    }

    //generate green, red, and regular text
    this.green = "";
    for (let i=0; i<this.current; i++) {
      this.green += `${this.words[i]} `;
    }
    this.green += this.correct;

    this.red = this.quote.substring(this.green.length, this.green.length+this.typed.length-this.correct.length);
    this.regular = this.quote.substring((this.green.length+this.red.length), this.quote.length);
    
    this.progress = this.green.length/this.quote.length*100;
    this.wpm = this.analytics.wpm(this.green.length, new Date());

    //if completed
    if (this.completed) {
      var endTime = new Date();
      this.elapsed = (endTime - this.startTime)/1000;
      this.wpm = Math.floor(this.words.length / this.elapsed * 60);
    }
  }

  displayWPM() {
    this.display = this.wpm;
    var point = this.chart.series[0].points[0];
    point.update(this.display);
  }

  ready() {
    this.getready = true;
    this.ready_txt = "Ready..."; 
    this.ready_style = {color: 'red'};
    setTimeout(() => {
      this.ready_txt = "Set...";
      this.ready_style = {color: 'yellow'};
      setTimeout(() => {
        this.ready_txt = "Go!";
        this.ready_style = {color: 'green'};
        setTimeout(() => {
          this.getready = false;
        }, 300);
      }, 1000);
    }, 1000);
    // focus on the input box
    this.focus = true;
  }

  // render the chart
  render() {
    this.chart = Highcharts.chart(this.mph, {
      chart: {
        type: 'solidgauge',
        backgroundColor: 'rgba(0,0,0,0)',
        height: '250px'
      },

      title: null,

      pane: {
          center: ['50%', '85%'],
          size: '100%',
          startAngle: -100,
          endAngle: 100,
          background: {
              backgroundColor:
                  Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
              innerRadius: '80%',
              outerRadius: '100%',
              shape: 'arc'
          }
      },

      exporting: {
          enabled: false
      },

      tooltip: {
          enabled: false
      },

      // the value axis
      yAxis: {
          stops: [
              [0.1, '#55BF3B'], // green
              [0.5, '#DDDF0D'], // yellow
              [0.9, '#DF5353'] // red
          ],
          lineWidth: 3,
          tickWidth: 0,
          minorTickInterval: 10,
          tickAmount: 8,
          title: {
              y: -70
          },
          labels: {
              y: 16
          },
          min: 0,
          max: 120,
          title: {
              text: ''
          }
      },

      plotOptions: {
          solidgauge: {
            innerRadius: '80%',
            dataLabels: {
                y: 0,
                borderWidth: 0,
                useHTML: true
            }
          }
      },

      credits: {
        enabled: false
      },

      series: [{
          name: 'Speed',
          data: [0],
          dataLabels: {
              format:
                  '<div style="text-align:center">' +
                  '<span style="font-size:25px">{y}</span><br/>' +
                  '<span style="font-size:12px;opacity:0.4">WPM</span>' +
                  '</div>'
          },
          tooltip: {
              valueSuffix: ' WPM'
          }
      }]
    });

  }
}
