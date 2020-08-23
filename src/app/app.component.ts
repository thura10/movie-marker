import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {UserService} from './user.service';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
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
  verified: boolean;
  showAlert: boolean;

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
  openStaticModal(content) {
    this.modal.open(content, {windowClass: 'modal-holder', centered: true, backdrop: 'static'});
  }

  onAuth() {
    this.userService.authUser().subscribe(result => {
      if (result[0].auth) {
        this.userService.setSession(result[0].username);
        this.user = this.userService.getSession()
        this.verified = result[0].verify;
        if (!this.verified) this.showAlert = true;
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
          this.userService.sendVerificationEmail().subscribe(data => {
            this.modal.dismissAll();
            window.location.reload();
          })
          this.registerSubmitted = false;
          this.registerError = "";
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

  pwResetEmail = new FormControl('');
  pwResetEmailError: boolean = false;
  sendVerifyEmail(modal) {
    if (!this.pwResetEmail.value) this.pwResetEmailError = true;
    this.userService.sendResetEmail(this.pwResetEmail.value).subscribe(data => {
      if (!data.email) this.pwResetEmailError = true;
      else {
        this.modal.dismissAll()
        setTimeout(() => this.openStaticModal(modal))
      }
    })
    this.pwResetEmail.valueChanges.subscribe(data => this.pwResetEmailError = false)
  }

  verificationPin = new FormControl('');
  verifyPinError: boolean;

  verifyPin(modal) {
    if (this.userService.getToken()) {
      this.userService.verifyEmail(this.verificationPin.value).subscribe(data => {
        if (!data.verify) this.verifyPinError = true;
        else {
          this.modal.dismissAll();
          this.onAuth();
        }
      })
    }
    else {
      this.userService.verifyPin(this.pwResetEmail.value, this.verificationPin.value).subscribe(data => {
        if (!data.verify) this.verifyPinError = true;
        else {
          this.modal.dismissAll();
          this.onAuth();
          setTimeout(() => this.openStaticModal(modal));
        }
      })
    }

  }
  pinKeyDown(event) {
    if (Math.ceil(Math.log10(this.verificationPin.value + 1)) >= 6 && (47<event.keyCode && event.keyCode<58 && event.shiftKey==false)) {
      return false;
    }
    else {
      return event.ctrlKey || event.altKey || (47<event.keyCode && event.keyCode<58 && event.shiftKey==false) || (95<event.keyCode && event.keyCode<106) || (event.keyCode==8) || (event.keyCode==9) || (event.keyCode>34 && event.keyCode<40) || (event.keyCode==46);
    }
  }

  changePw = new FormControl('', Validators.required);
  changePw2 = new FormControl('');
  changePwError: string = '';

  changePassword(modal) {
    this.changePwError = '';
    if (this.changePw.value === this.changePw2.value) {
      if (this.changePw.errors && this.changePw.errors.required) {
        this.changePwError = "Please enter all the required fields"
      }
      else if (this.changePw.value.length < 6) {
        this.changePwError = "Password must be 6 or more characters"
      }
      else {
        this.userService.changePassword(this.pwResetEmail.value, this.verificationPin.value, this.changePw.value).subscribe(data => {
          if (data.change) {
            this.changePwError = '';
            this.modal.dismissAll();
            setTimeout(() => this.openStaticModal(modal))
          }
          else {
            this.changePwError = "An unknown error occurred"
          }
        })
      }
    }
    else {
      this.changePwError = "Please enter the same password"
    }
  }

  resendEmailShown: boolean = true;
  resendEmail() {
    if (this.userService.getToken()) {
      this.userService.sendVerificationEmail().subscribe(data => {});
    }
    else {
      this.userService.sendResetEmail(this.pwResetEmail.value).subscribe(data => {});
    }
    this.resendEmailShown = false;
    setTimeout(() => {
      this.resendEmailShown = true;
    }, 30000);
  }

}
