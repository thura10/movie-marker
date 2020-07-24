import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tv-item',
  templateUrl: './tv-item.component.html',
  styleUrls: ['../list-item.component.css']
})
export class TvItemComponent implements OnInit {

  @Input() tv: any

  constructor() { }
  ngOnInit() {
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
