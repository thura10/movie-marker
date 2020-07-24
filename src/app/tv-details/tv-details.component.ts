import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { TmdbService } from '../tmdb.service';
import { UiService } from "../ui.service";

@Component({
  selector: 'app-tv-details',
  templateUrl: './tv-details.component.html',
  styleUrls: ['../common/item-details.component.css']
})
export class TvDetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  tv: any;

  constructor(private route: ActivatedRoute, private ui: UiService, private tmdb: TmdbService) { }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      let id = params['id'];
      this.tmdb.getMovieDetails(id).subscribe(result => {
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
  getDirectors(crews: any[]) {
    let directors = crews.filter(crew => {
      return crew.job === "Director"
    })
    return directors
  }
}
