import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {TmdbService} from '../tmdb.service';
import { UiService } from "../ui.service";

import {fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';

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

  @ViewChild("searchText") searchText: ElementRef;

  constructor(private tmdb: TmdbService, private ui: UiService) { }
  ngOnInit() {}

  ngAfterViewInit() {
    fromEvent(this.searchText.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(1000),
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
}
