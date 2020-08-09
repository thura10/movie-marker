import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['../common/list-item.component.css']
})
export class MovieItemComponent implements OnInit {

  @Input() movie: any;
  @Input() small: boolean;

  addingToCollection: boolean;

  constructor() { }
  ngOnInit() {
  }

  addFinished() {
    this.addingToCollection = false;
  }

  getPoster(poster: string) {
    if (poster) {
      return "https://image.tmdb.org/t/p/w500" + poster
    }
    else {
      return "../../assets/defaultPoster.png"
    }
  }
}
