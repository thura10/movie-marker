import { Component, OnInit, OnDestroy, ElementRef, Directive, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { TmdbService } from '../../tmdb.service';
import { UiService } from "../../ui.service";

import { trigger, state, style, animate, transition } from '@angular/animations';
import 'scroll-into-view';
import { UserService } from 'src/app/user.service';

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
  styleUrls: ['../../common/item-details.component.css', './tv-details.component.css'],
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

  constructor(private route: ActivatedRoute, private ui: UiService, private tmdb: TmdbService, private userService: UserService) { }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      this.selectedSeason = null;
      this.season = {};
      this.hoveredSeasonNumber = null;
      
      let id = params['id'];
      this.tmdb.getTvDetails(id).subscribe(result => {
        this.tv = result;
        this.dataChanged('');
        this.ui.stopSpinner();
      })
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getPoster(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w500" + poster
    }
    else {
      return "../../../assets/defaultPoster.png"
    }
  }
  getBackdrop(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w1280" + poster
    }
    else {
      return "../../../assets/dashboardBg.png"
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
    let str = `S${episode.season_number} E${episode.episode_number}: ${episode.name}`
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

  addingToCollection: boolean;
  addFinished() {
    this.addingToCollection = false;
  }

  watched: any[] = [];
  favourite: any[] = [];
  isWatched: boolean;
  isFavourite: boolean;

  dataChanged(event) {
    if (!this.userService.getToken()) return;
    switch (event) {
      case 'watched':
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
          this.isWatched = this.watched.some((item) => {
            return item.id === this.tv.id;
          })
        })
        break;
      case 'favourite':
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
          this.isFavourite = this.favourite.some((item) => {
            return item.id === this.tv.id;
          })
        });
        break;
      default:
        this.userService.getWatched().subscribe(res => {
          this.watched = res;
          this.isWatched = this.watched.some((item) => {
            return item.id === this.tv.id;
          })
        });
        this.userService.getFavourite().subscribe(res => {
          this.favourite = res;
          this.isFavourite = this.favourite.some((item) => {
            return item.id === this.tv.id;
          })
        });
    }
  }

  addWatched() {
    if (this.isWatched) {
      this.userService.removeWatchedItem('tv', this.tv.id).subscribe(res => {
        this.dataChanged('watched');  
      })
      this.isWatched = false;
    }
    else {
      this.userService.addWatchedItem('tv', this.tv.id, this.tv.poster_path, this.tv.name).subscribe(res => {
        this.dataChanged('watched');        
      })
      this.isWatched = true;
    }
  }
  addFavourite() {
    if (this.isFavourite) {
      this.userService.removeFavouriteItem('tv', this.tv.id).subscribe(res => {
        this.dataChanged('favourite');
      })
      this.isFavourite = false;
    }
    else {
      this.userService.addFavouriteItem('tv', this.tv.id, this.tv.poster_path, this.tv.name).subscribe(res => {
        this.dataChanged('favourite');
      })
      this.isFavourite = true;
    }
  }

}
