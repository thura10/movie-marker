import { Component, Input, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';
import { UiService } from '../ui.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.css']
})
export class CollectionEditComponent implements AfterViewInit, OnInit {

  @Input() mode: string;
  @Input() id: string;
  @Input() name: string;
  @Output() editDone = new EventEmitter();

  @ViewChild('shareCollectionModal') shareCollectionModal: ElementRef;
  @ViewChild('deleteCollectionModal') deleteCollectionModal: ElementRef;
  @ViewChild('editCollectionModal') editCollectionModal: ElementRef;

  shareUsername = new FormControl();
  shareSubmitted: boolean;
  shareError: string = '';

  editCollectionName = new FormControl('');
  editCollectionSubmitted: boolean;

  permissions: any[];

  constructor(private modal: NgbModal, private userService: UserService, private ui: UiService) { }

  ngOnInit() {
    if (this.mode == 'share') {
      this.ui.showSpinner();
      this.userService.getCollectionPermission(this.id).subscribe(result => {
        this.permissions = result;
        this.ui.stopSpinner();
      })  
    }
    this.shareUsername.setValidators(Validators.required);
  }

  ngAfterViewInit() {
    if (this.mode == 'share') {
      setTimeout(() => this.modal.open(this.shareCollectionModal, {windowClass: 'modal-holder', centered: true, beforeDismiss: () => this.editFinish()}))
    }
    else if(this.mode == 'delete') {
      setTimeout(() => this.modal.open(this.deleteCollectionModal, {windowClass: 'modal-holder', centered: true, beforeDismiss: () => this.editFinish()}))
    }
    else if (this.mode == 'edit') {
      this.editCollectionName.setValue(this.name);
      setTimeout(() => this.modal.open(this.editCollectionModal, {windowClass: 'modal-holder', centered: true, beforeDismiss: () => this.editFinish()}))
    }
  }

  editFinish() {
    this.editDone.emit('done');
    return true;
  }

  addPermission() {
    this.shareSubmitted = true;

    let username = this.shareUsername.value;
    if (username) {
      if (this.permissions.indexOf(username) > -1 || username == this.userService.getSession()) {
        this.shareError = "User already added"
        return;
      }
      this.ui.showSpinner();
      this.userService.checkUser(username).subscribe(result => {
        if (result.user) {
          this.permissions.unshift(username);
          this.shareSubmitted = false;
          this.shareUsername.reset();
        }
        else {
          this.shareError = "User doesn't exist"
        }
        this.ui.stopSpinner();
      })
    }
  }
  removePermission(username: string) {
    let index = this.permissions.indexOf(username);
    if (index > -1) {
      this.permissions.splice(index, 1)
    }
  }

  savePermission() {
    this.ui.showSpinner();
    this.userService.saveCollectionPermission(this.id, this.permissions).subscribe(result => {
      this.ui.stopSpinner();
      this.modal.dismissAll();
      this.editFinish();
    })
  }
  deleteCollection() {
    this.ui.showSpinner();
    this.userService.deleteCollection(this.id).subscribe(result => {
      this.ui.stopSpinner();
      this.modal.dismissAll();
      this.editFinish();
    })
  }
  editCollection() {
    this.ui.showSpinner();

    let name = this.editCollectionName.value;
    if (name && this.editCollectionName.valid) {
      this.userService.editCollection(this.id, name).subscribe(result => {
        this.ui.stopSpinner();
        this.modal.dismissAll();
        this.editFinish();
      })
    }
  }
}
