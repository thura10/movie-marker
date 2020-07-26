import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';
import { UiService } from '../ui.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html'
})
export class CollectionsComponent implements OnInit {

  constructor(private modal: NgbModal, private userService: UserService, private ui: UiService) { }

  collections: any[] = [];
  sharedCollections: any[] = [];

  addCollectionName = new FormControl();
  addCollectionSubmitted: boolean;

  collectionEdit: boolean;
  collectionEditId: string;
  collectionEditMode: string;
  collectionEditName: string;

  ngOnInit() {
    this.addCollectionName.setValidators([Validators.required, Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]);
    this.ui.showSpinner();
    this.userService.getCollections().subscribe(result => {
      this.collections = result;
    })
    this.userService.getSharedCollections().subscribe(result => {
      this.sharedCollections = result;
      this.ui.stopSpinner();
    })
  }

  openModal(content) {
    this.modal.open(content, {windowClass: 'modal-holder', centered: true});
  }
  createCollection() {
    this.addCollectionSubmitted = true;

    let name = this.addCollectionName.value;
    let owner = this.userService.getSession();
    let ownerId = this.userService.getToken();
    if (name && owner && ownerId && this.addCollectionName.valid) {
      this.ui.showSpinner();
      this.userService.newCollection(name, owner, ownerId).subscribe(result => {
        if (result) {
          this.ui.stopSpinner();
          this.addCollectionSubmitted = false;
          this.modal.dismissAll();
          this.collectionEdit = true;
          this.collectionEditId = result._id;
          this.collectionEditMode = 'share';
        }
      })  
    }
  }

  editDone(edit) {
    if (edit == 'done') {
      this.collectionEdit = false;
      this.ngOnInit();
    }
  }
  collectionItemAction(collection) {
    this.collectionEdit = true;
    this.collectionEditId = collection._id;
    switch(collection.action) {
      case 'share':
        this.collectionEditMode = 'share'
        break;
      case 'edit':
        this.collectionEditMode = 'edit';
        this.collectionEditName = collection.name;
        break;
      case 'delete':
        this.collectionEditMode = 'delete';
        this.collectionEditName = collection.name;
        break;
    }
  }

}
