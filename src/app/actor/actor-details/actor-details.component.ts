import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from 'src/app/tmdb.service';
import { UiService } from 'src/app/ui.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-actor-details',
  templateUrl: './actor-details.component.html',
  styleUrls: ['./actor-details.component.css']
})
export class ActorDetailsComponent implements OnInit, OnDestroy {

  private sub: any;

  actor: any;
  list: any[] = [];

  query: string = "";
  search = new FormControl();

  constructor(private route: ActivatedRoute, private tmdb: TmdbService, private ui: UiService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      let id = params['id'];
      this.tmdb.getActorDetails(id).subscribe(res => {
        this.actor = res;
        this.list = res.combined_credits.cast;
        this.ui.stopSpinner();
      })
    })
    this.search.valueChanges.subscribe(res => {
      this.query = res;
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
      return "../../../assets/defaultPoster.png"
    }
  }

}
