import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-actor-item',
  templateUrl: './actor-item.component.html',
  styleUrls: ['../../common/list-item.component.css']
})
export class ActorItemComponent implements OnInit {

  @Input() actor: any;
  @Input() small: boolean;

  constructor() { }
  ngOnInit() {
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
