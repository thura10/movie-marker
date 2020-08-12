import { Component, OnInit } from '@angular/core';
import { TmdbService } from 'src/app/tmdb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-discover-list',
  templateUrl: './discover-list.component.html',
  styleUrls: ['./discover-list.component.css']
})
export class DiscoverListComponent implements OnInit {

  constructor(private tmdb: TmdbService, private route: ActivatedRoute, private router: Router, private ui: UiService) { }

  sub: any;

  id: string;
  type: string;

  title: string;
  list: any[] = [];

  collectionSize: number;

  updateData: (page: number) => void

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.type = params['type'];

      switch(`${this.type}/${this.id}`) {
        case 'movie/trending':
          this.title = "Trending Movies";
          this.updateData = (page: number) => {
            this.ui.showSpinner();
            this.tmdb.getTrendingMovies(page).subscribe(res => {
              this.list = res.results;
              this.collectionSize = res.total_results > 400 ? 400 : 200;
              this.ui.stopSpinner();
            })
          }
          break;
        case 'tv/trending':
          this.title = "Trending Shows";
          this.updateData = (page: number) => {
            this.ui.showSpinner();
            this.tmdb.getTrendingTv(page).subscribe(res => {
              this.list = res.results;
              this.collectionSize = res.total_results > 400 ? 400 : 200;
              this.ui.stopSpinner();
            })
          }
          break;
        case 'movie/popular':
          this.title = "Popular Movies";
          this.updateData = (page: number) => {
            this.ui.showSpinner();
            this.tmdb.getPopularMovies(page).subscribe(res => {
              this.list = res.results;
              this.collectionSize = res.total_results > 400 ? 400 : 200;
              this.ui.stopSpinner();
            })
          }
          break;
        case 'tv/popular':
          this.title = "Popular Shows";
          this.updateData = (page: number) => {
            this.ui.showSpinner();
            this.tmdb.getPopularTv(page).subscribe(res => {
              this.list = res.results;
              this.collectionSize = res.total_results > 400 ? 400 : 200;
              this.ui.stopSpinner();
            })
          }
          break;
        default:
          this.router.navigateByUrl('/discover')
      }
      this.updateData(1);
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  pageChanged(event) {
    this.updateData(event)
  }
}
