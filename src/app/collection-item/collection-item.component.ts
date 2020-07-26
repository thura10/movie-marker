import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['../common/list-item.component.css']
})
export class CollectionItemComponent implements OnInit {

  @Input() collection: any;
  @Output() collectionAction = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }
  performCollectionAction(id: number, action: string, name: string) {
    this.collectionAction.emit({'_id': id, 'action': action, 'name': name})
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
