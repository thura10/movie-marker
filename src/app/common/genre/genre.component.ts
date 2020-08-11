import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from 'src/app/tmdb.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css']
})
export class GenreComponent implements OnInit, OnDestroy {

  sub: any;

  id: string;
  type: string;

  genre: string;
  list: any[] = [];

  collectionSize: number;
  search = new FormControl();
  query: string = "";

  constructor(private route: ActivatedRoute, private tmdb: TmdbService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.type = params['type'];

      this.tmdb.getGenreList(this.type).subscribe(res => {
        let genres = res.genres;
        let genre = genres.find(genre => genre.id == this.id);

        if (genre) this.genre = genre.name;
      })
      this.tmdb.getGenreItems(this.id, this.type, 1).subscribe(res => {
        this.list = res.results;
        this.collectionSize = res.total_results;
      })
    })
    this.search.valueChanges.subscribe(res => {
      this.query = res;
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  pageChanged(event) {
    this.tmdb.getGenreItems(this.id, this.type, event).subscribe(res => {
      this.list = res.results;
    })
  }

}
