import { Component, OnInit, OnDestroy } from '@angular/core';
import { TmdbService } from 'src/app/tmdb.service';
import { UiService } from 'src/app/ui.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-episode-details',
  templateUrl: './episode-details.component.html',
  styleUrls: ['../../common/item-details.component.css']
})
export class EpisodeDetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  episode: any;
  name: string;
  id:number;

  constructor(private tmdb: TmdbService, private ui: UiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.ui.showSpinner();
      this.id = params['id'];
      let season = params['season'];
      let episode = params['episode'];
      this.name = params['name'];

      this.tmdb.getEpisodeDetails(this.id, season, episode).subscribe(res => {
        this.episode = res;
        this.ui.stopSpinner();
      }, 
      (err) => {
        this.router.navigateByUrl('/')
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
      return "../../../assets/defaultPoster.png"
    }
  }
  getBackdrop(episode: any) {
    if (episode.images.stills && episode.images.stills.length) {
      return this.getPoster(episode.images.stills[episode.images.stills.length-1].file_path);
    }
    return this.getPoster(episode.still_path)
  }

  formatDate(date: string) {
    const dates = date.split('-');
    const months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];
    return `${dates[2]} ${months[parseInt(dates[1])-1]} ${dates[0]}`
  }

}
