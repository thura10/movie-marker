import { Component, OnInit, OnDestroy, ElementRef, Directive, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { TmdbService } from '../tmdb.service';
import { UiService } from "../ui.service";

import { trigger, state, style, animate, transition } from '@angular/animations';
import 'scroll-into-view';

@Directive({ selector: '[scrollTo]'})
export class ScrollToDirective implements AfterViewInit {
  constructor(private elRef:ElementRef) {}
  ngAfterViewInit() {
    let element = this.elRef.nativeElement;

    let rect = element.getBoundingClientRect();
    let elemTop = rect.top;
    let elemBottom = rect.bottom;

    let isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);

    if (!isVisible) {
      let container = document.documentElement;
      container.scrollTo({top: window.innerHeight - (rect.height-25), behavior: 'smooth'});
    }
  }
}

@Component({
  selector: 'app-tv-details',
  templateUrl: './tv-details.component.html',
  styleUrls: ['../common/item-details.component.css', './tv-details.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 0, opacity: 1 }),
            animate('0.5s ease-out', 
                    style({ height: 266, opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 266, opacity: 1 }),
            animate('0.5s ease-in', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class TvDetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  tv: any;

  selectedSeason: number = null;
  season: any = {};
  hoveredSeasonNumber: number = null;

  constructor(private route: ActivatedRoute, private ui: UiService, private tmdb: TmdbService) { }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      this.selectedSeason = null;
      this.season = {};
      this.hoveredSeasonNumber = null;
      
      let id = params['id'];
      this.tmdb.getTvDetails(id).subscribe(result => {
        this.tv = result;
        this.ui.stopSpinner();
      })
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getPoster(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w500" + poster
    }
    else {
      return "../../assets/defaultPoster.png"
    }
  }
  getBackdrop(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w1280" + poster
    }
    else {
      return "../../assets/dashboardBg.png"
    }
  }
  getInfo(info: any[]) {
    let str: string = "";
    for (let i=0; i< info.length; i++) {
      if (info[i].name) {
        str += info[i].name + " • "
      }
      if (i== info.length -1) {
        str= str.slice(0,-3)
      }
    }
    return str
  }
  getLastEpisode(episode: any) {
    if (!episode.season_number || !episode.episode_number || !episode.name) return "";
    let str = `${episode.season_number}x${episode.episode_number}: ${episode.name}`
    if (episode.air_date) {
      let date = episode.air_date.split('-');
      str += ` (${date[2]}-${date[1]}-${date[0]})`
    }
    return str
  }

  selectSeason(id: number) {
    if (this.selectedSeason == id) {
      this.selectedSeason = null;
    }
    else {
      this.ui.showSpinner();
      this.selectedSeason = id;
      this.tmdb.getSeasonDetails(this.tv.id, this.selectedSeason.toString()).subscribe(result => {
        this.season = result;
        this.ui.stopSpinner();
      })
    }
  }
  seasonMouseHover(seasonNo: number) {
    this.hoveredSeasonNumber = seasonNo;
  }
}
