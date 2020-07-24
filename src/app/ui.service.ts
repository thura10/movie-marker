import { Injectable, Component } from '@angular/core';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-spinner',
  template: `<div style="background-color: rgba(0,0,0,0.5);" class="d-flex fixed-top w-100 h-100">
              <span class="intro-banner-vdo-play-btn overlayBg" target="_blank">
                <i class="glyphicon glyphicon-play whiteText" aria-hidden="true"></i>
                <span class="ripple overlayBg"></span>
                <span class="ripple overlayBg"></span>
                <span class="ripple overlayBg"></span>
              </span>
            </div>`,
  styles: [`.overlayBg { background-color: #E54848!important; } .intro-banner-vdo-play-btn{ height:40px; width:40px; position:absolute; top:50%; left:50%; text-align:center; margin:-30px 0 0 -30px; border-radius:100px; z-index:1 } .intro-banner-vdo-play-btn i{ line-height:56px; font-size:30px } .intro-banner-vdo-play-btn .ripple{ position:absolute; width:160px; height:160px; z-index:-1; left:50%; top:50%; opacity:0; margin:-80px 0 0 -80px; border-radius:100px; -webkit-animation:ripple 1.8s infinite; animation:ripple 1.8s infinite } @-webkit-keyframes ripple{ 0%{ opacity:1; -webkit-transform:scale(0); transform:scale(0) } 100%{ opacity:0; -webkit-transform:scale(0.7); transform:scale(0.7) } } @keyframes ripple{ 0%{ opacity:1; -webkit-transform:scale(0); transform:scale(0) } 100%{ opacity:0; -webkit-transform:scale(.7); transform:scale(.7) } } .intro-banner-vdo-play-btn .ripple:nth-child(2){ animation-delay:.3s; -webkit-animation-delay:.3s } .intro-banner-vdo-play-btn .ripple:nth-child(3){ animation-delay:.6s; -webkit-animation-delay:.6s }`]
})
export class SpinnerComponent {
  constructor() { }
}

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private spinnerRef: OverlayRef = this.cdkSpinnerCreate();
  constructor(private overlay: Overlay) { }

  private cdkSpinnerCreate() {
    return this.overlay.create({
           hasBackdrop: true,
           backdropClass: 'dark-backdrop',
           positionStrategy: this.overlay.position()
            .global()
            .centerHorizontally()
            .centerVertically()
           })
  }
  showSpinner() {
    if (!this.spinnerRef.hasAttached()) {
      this.spinnerRef.attach(new ComponentPortal(SpinnerComponent))
    }
  }
  stopSpinner() {
    if (this.spinnerRef.hasAttached()) {
      this.spinnerRef.detach();
    }
  }
}
