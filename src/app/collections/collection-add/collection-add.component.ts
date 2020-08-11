import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../user.service';
import { UiService } from '../../ui.service';

@Component({
  selector: 'app-collection-add',
  templateUrl: './collection-add.component.html',
  styleUrls: ['./collection-add.component.css'],
})
export class CollectionAddComponent implements AfterViewInit, OnInit {

  @Input() item: any;
  @Input() type: string;
  @Output() done = new EventEmitter<boolean>();

  @ViewChild('addCollectionModal') shareCollectionModal: ElementRef;

  collections: any[];
  posters: any[] = [];

  constructor(private modal: NgbModal, private userService: UserService, private ui: UiService) { }

  ngOnInit() {
    this.ui.showSpinner();
    this.userService.getCollections().subscribe(result => {
      this.collections = result;
      this.ui.stopSpinner();
      for (let collection of this.collections) {
        this.posters.push(this.getCollectionPoster(collection.items))
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => this.modal.open(this.shareCollectionModal, {windowClass: 'modal-holder', centered: true, beforeDismiss: () => this.addFinished()}));
  }

  addFinished() {
    this.done.emit(true);
    return true;
  }
  getCollectionPoster(items: any[]) {
    let item = items[Math.floor(Math.random() * items.length)];
    if (items.length != 0 && item.poster_path) {
      return "https://image.tmdb.org/t/p/w500" + item.poster_path;
    }
    else {
      return "../../assets/examplePoster.jpg"
    }
  }

  addToCollection(collection) {
    let name = this.type==='movie' ? this.item.title : this.item.name;
    
    this.ui.showSpinner();
    this.userService.addCollectionItem(this.type, this.item.id, this.item.poster_path, name, collection._id).subscribe(result => {
      this.ui.stopSpinner();
      this.ngOnInit();
    });
  }
  checkIfAdded(items: any[]) {
    return items.some(item => 
      (this.item.name === item.name || this.item.title === item.title) && this.item.id === item.id && this.type === item.type 
    )
  }
  removeFromCollection(collection) {
    this.ui.showSpinner();
    this.userService.removeCollectionItem(collection._id, this.item.id, this.type).subscribe(result => {
      this.ui.stopSpinner();
      this.ngOnInit();
    })
  }

}
