import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../tmdb.service';
import { UserService } from '../user.service';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor(private tmdb: TmdbService, private userService: UserService, private ui: UiService) { }

  ngOnInit() {
    this.dataChanged('');
    this.week = this.startAndEndOfWeek('');

    this.updateShowData();
  }

  shows: any[];

  watched: any[] = [];
  favourite: any[] = [];

  dataChanged(event) {
    if (!this.userService.getToken()) return;
    switch (event) {
      case 'watched':
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
        })
        break;
      case 'favourite':
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
        });
        break;
      default:
        this.dataChanged('watched');
        this.dataChanged('favourite');
    }
  }

  week: any[];
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  startAndEndOfWeek(date) {
    // If no date object supplied, use current date
    // Copy date so don't modify supplied date
    var now = date? new Date(date) : new Date();
  
    // set time to some convenient value
    now.setHours(0,0,0,0);
    let days = [];

    var day = new Date(now);
    for (let i=1; i<8; i++) {
      day.setDate(day.getDate() - day.getDay() + i);
      days.push({
        day: this.dayNames[day.getDay()],
        date: day.getDate(),
        month: this.monthNames[day.getMonth()],
        year: day.getFullYear()
      })
    }
    // Return array of date objects
    return days;
  }

  prevWeek() {
    let startDate = new Date(this.week[0].year, this.monthNames.indexOf(this.week[0].month), this.week[0].date);

    this.week = this.startAndEndOfWeek(startDate.setDate(startDate.getDate() - 3));
    this.updateShowData();
  }
  nextWeek() {
    let currentEndDay = this.week[this.week.length - 1];
    let endDate = new Date(currentEndDay.year, this.monthNames.indexOf(currentEndDay.month), currentEndDay.date);

    this.week = this.startAndEndOfWeek(endDate.setDate(endDate.getDate() + 1));
    this.updateShowData();
  }
  
  updateShowData() {
    this.ui.showSpinner();
    let startDate = this.changeIntoTmdbDate(this.week[0]);
    let endDate = this.changeIntoTmdbDate(this.week[this.week.length -1])

    this.tmdb.getCalendarShows(startDate, endDate).subscribe(res => {
      this.shows = res;
      this.ui.stopSpinner();
    })
  }

  getResultsForDay(day: any, shows: any[]) {
    let date = this.changeIntoTmdbDate(day);
    let results = shows.filter((show) => {
      if (show.last_air_date == date) {
        return Object.assign(show, {calendar: 'last'})
      }
      else if (show.next_episode_to_air && show.next_episode_to_air.air_date == date) {
        return Object.assign(show, {calendar: 'next'});
      }
    })
    return results;
  }
  changeIntoTmdbDate(day: any) {
    return `${day.year}-${(this.monthNames.indexOf(day.month)+1).toString().padStart(2,'0')}-${day.date.toString().padStart(2,'0')}`
  }

  ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  }

}
