import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {TmdbService} from '../tmdb.service';
import { UiService } from "../ui.service";

import {fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  searching = false
  movieResults: any = [];
  tvResults: any = [];
  actorResults: any = [];

  watched: any[] = [];
  favourite: any[] = [];

  @ViewChild("searchText") searchText: ElementRef;

  constructor(private tmdb: TmdbService, private ui: UiService, private userService: UserService) { }
  ngOnInit() {
    //get data for watched and favourite
    this.dataChanged('');
    this.getNextUp();
    this.getForYou();
  }

  ngAfterViewInit() {
    fromEvent(this.searchText.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((text) => {
                  const term = this.searchText.nativeElement.value;
                  this.ui.showSpinner();
                  if (term == "") {
                    this.searching = false;
                    this.ui.stopSpinner();
                    return;
                  }
                  this.tmdb.search(term).subscribe(results => {
                    this.ui.stopSpinner();
                    this.movieResults = results.filter(item => {
                      this.searching = true;
                      return item.media_type === "movie"
                    }).slice(0,20)
                    this.tvResults = results.filter(item => {
                      this.searching = true;
                      return item.media_type === "tv"
                    }).slice(0,20)
                    this.actorResults = results.filter(item => {
                      this.searching = true;
                      return item.media_type === "person"
                    }).slice(0,20)
                  })
                })
            )
            .subscribe();
  }
  searchFocus() {
    this.searchText.nativeElement.focus();
  }

  overviewIndex: number = 0;
  scrollOverviewPrev(overviewItems: HTMLElement) {
    const items = overviewItems.getElementsByClassName("w-100");

    this.overviewIndex--;
    if (this.overviewIndex < 0) this.overviewIndex = 2
    overviewItems.style.overflowX = "auto";
    items[this.overviewIndex].scrollIntoView({behavior: "smooth"});
    overviewItems.style.overflowX = "hidden";
  }
  scrollOverviewNext(overviewItems: HTMLElement) {
    const items = overviewItems.getElementsByClassName("w-100");

    this.overviewIndex++
    if (this.overviewIndex >= items.length) this.overviewIndex = 0
    overviewItems.style.overflowX = "auto";
    items[this.overviewIndex].scrollIntoView({behavior: "smooth"});
    overviewItems.style.overflowX = "hidden";
  }

  dataChanged(event) {
    if (!this.userService.getToken()) return;
    switch (event) {
      case 'watched':
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
          this.calculateWatchtime();
        })
        break;
      case 'favourite':
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
        });
        break;
      case 'collection':
        this.getCollectionCount();
        break;
      default:
        this.dataChanged('watched');
        this.dataChanged('favourite');
        this.getCollectionCount();
    }
  }

  movieWatchedCount: number;
  movieWatchtime: string;

  tvWatchedCount: number;
  episodeWatchedCount: number;
  tvWatchtime: string;

  calculateWatchtime() {
    if (!this.userService.getToken()) return;

    this.movieWatchedCount = 0;
    let movieTime = 0;

    this.tvWatchedCount = 0;
    this.episodeWatchedCount = 0;
    let tvTime = 0;

    this.watched.forEach((item) => {
      if (item.type == 'movie') {
        //push movie items into movie and plus runtime
        this.movieWatchedCount += 1;
        if (!isNaN(item.runtime)) movieTime += item.runtime;
      }
      else if (item.type == 'tv') {
        this.tvWatchedCount += 1;
        if (!isNaN(item.runtime)) tvTime += item.runtime;
        if (!isNaN(item.episode_count)) this.episodeWatchedCount += item.episode_count;
      }
    })
    this.movieWatchtime = this.convertMinIntoDisplayFormat(movieTime);
    this.tvWatchtime = this.convertMinIntoDisplayFormat(tvTime);
  }

  convertMinIntoDisplayFormat(time: number) {
    if (time > 60) {
      let hour = Math.floor(time/60);
      time = time % 60;
      if (hour > 24) {
        let day = Math.floor(hour/24);
        hour = hour % 24;
        let str = `${day} days`;
        str += hour ? `, ${hour} hours` : '';
        str += time ? `, ${time} minutes` : '';
        str += ' of watchtime';
        return str;
      }
      let str = `${hour} hours`;
      str += time ? `, ${time} minutes` : '';
      str += ' of watchtime';
      return `${hour} hours, ${time} minutes of watchtime`
    }
    return `${time} minutes of watchtime`;
  }

  movieCollectionCount: number = 0;
  tvCollectionCount: number = 0;

  getCollectionCount() {
    if (!this.userService.getToken()) return;
    this.userService.getCollectionCount().subscribe(res => {
      if (res) {
        this.movieCollectionCount = res.movieCount;
        this.tvCollectionCount = res.tvCount;
      }
    })
  }

  nextUp: any[] = [];
  foryou: any[] = [];
  getNextUp() {
    if (!this.userService.getToken()) return;
    this.userService.getNextUp().subscribe(res => {
      this.nextUp = res;
      this.nextUp.forEach(tv => {
        if (tv.next_episode_to_air) return Object.assign(tv, {calendar: 'next'});
        Object.assign(tv, {calendar: 'last'});
      });
    })
  }
  getForYou() {
    if (!this.userService.getToken()) return;
    this.ui.showSpinner();
    this.userService.getForYou().subscribe(res => {
      this.foryou = res;
      this.ui.stopSpinner();
    })
  }
}
