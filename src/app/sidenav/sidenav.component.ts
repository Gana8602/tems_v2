import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  constructor (private layout:LayoutComponent){}

  onPageChange(name:String){
    this.layout.page = name;
    console.log(this.layout.page);
  }
}
