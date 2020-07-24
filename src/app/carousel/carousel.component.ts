import { Component, Input, OnChanges, ViewChildren } from '@angular/core';

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent implements OnChanges {

  @Input() videos: any[];
  @Input() images: any[];

  carouselVideos: any[];
  carouselImages: any[];

  @ViewChildren('player') players;
  constructor() { }

  ngOnChanges() {
    this.carouselVideos = this.videos.filter((video) => {
      return video.site === "YouTube" && video.type === "Trailer"
    }).slice(0,3);
    this.carouselImages = this.images.slice(1,4);
  }
  onSlide(slide) {
    let id = slide.prev;
    if (id < this.carouselVideos.length) {
      this.players._results[id].nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    }
  }
}
