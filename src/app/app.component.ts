import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {UserService} from './user.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { UiService } from './ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isCollapsed = true
  title = 'Movie Marker';
  constructor(private modal: NgbModal, private fb: FormBuilder, private userService: UserService, private ui: UiService) {}

  user: string = '';
  loginForm: FormGroup;
  registerForm: FormGroup;
  registerPassword: FormGroup;

  loginSubmitted = false;
  loginError: string = "";
  registerSubmitted = false;
  registerError: string = "";

  admin: boolean = false;

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
      let pass = group.value.password;
      let confirmPass = group.value.password1;

      return pass === confirmPass ? null : { notSame: true }     
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      loginUsername: ['', Validators.required],
      loginPassword: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      registerUsername: ['', [Validators.required, Validators.minLength(5)]],
      registerEmail: ['', [Validators.required, Validators.email]],
    });
    this.registerPassword = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password1: '',
    })
    this.registerPassword.setValidators(this.checkPasswords)
    this.onAuth();

    this.userService.checkAdmin().subscribe(res => {
      if (res && res.admin) {
        this.admin = res.admin;
      }
    })
  }

  openModal(content) {
    this.modal.open(content, {windowClass: 'modal-holder', centered: true});
  }

  onAuth() {
    this.userService.authUser().subscribe(result => {
      if (result[0].auth) {
        this.userService.setSession(result[0].username);
        this.user = this.userService.getSession()
      }
      else {
        this.user = ''
      }
    })
  }

  onLogin() {
    this.loginSubmitted = true;
    if (this.loginForm.valid) {
      this.ui.showSpinner();
      this.userService.loginUser(this.loginForm.value.loginUsername, this.loginForm.value.loginPassword).subscribe(result => {
        if (result[0].auth) {
          this.userService.setToken(result[0]._id);
          this.ngOnInit();
          this.modal.dismissAll();
          this.loginSubmitted = false;
          this.loginError = "";
          window.location.reload();
        }
        else if (result[0].reason == "username") {
          this.loginError = "Invalid Username"
        }
        else if (result[0].reason == "password") {
          this.loginError = "Incorrect password"
        }
        else {
          this.loginError = "An error occurred while logging in"
        }
        this.ui.stopSpinner();
      })
    }
  }

  onLogout() {
    this.userService.logout();
    window.location.reload();
  }

  onRegister() {
    this.registerSubmitted = true;

    if (this.registerForm.valid && this.registerPassword.valid) {
      this.ui.showSpinner();
      this.userService.registerUser(this.registerForm.value.registerUsername, this.registerForm.value.registerEmail, this.registerPassword.value.password).subscribe(result => {
        if (result[0].register) {
          this.userService.setToken(result[0]._id);
          this.ngOnInit();
          this.modal.dismissAll();
          this.registerSubmitted = false;
          this.registerError = "";
          window.location.reload();
        }
        else if (result[0].reason == "username") {
          this.registerError = "An account with the specified username already exists"
        }
        else if (result[0].reason == "email") {
          this.registerError = "An account with the specified email already exists"
        }
        else {
          this.registerError = "An error occurred while creating a new account"
        }
        this.ui.stopSpinner();
      })
    }
  }

  collectionRoute(modal) {
    if (!this.userService.getToken()) {
      this.openModal(modal);
    }
  }

}
