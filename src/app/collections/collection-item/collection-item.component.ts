import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['../../common/list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  getCollectionPoster(items: any[]) {
    let item = items[Math.floor(Math.random() * items.length)];
    if (items.length != 0 && item.poster_path) {
      return "https://image.tmdb.org/t/p/w500" + item.poster_path;
    }
    else {
      return "../../assets/exampleCollection.jpg"
    }
  }
}
