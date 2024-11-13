import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
 imports:[RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'tems_v2';
 

  // constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  // ngOnInit(): void {
  //   if (isPlatformBrowser(this.platformId)) {
  //     this.setZoomLevel();
  //     window.addEventListener("resize", this.setZoomLevel);
  //   }
  // }

  // setZoomLevel(): void {
  //   document.body.style.zoom = `${200 / window.devicePixelRatio}%`;
  // }
}
