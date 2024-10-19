import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, ToastrModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  
  constructor (private layout:LayoutComponent, private router:Router, private toastr:ToastrService){}
  isPageSelected(page: string): boolean {
    return this.layout.page === page;
  }
  onPageChange(name:String){
    if(name === 'Dashboard'){
      this.toastr.warning('Please Select the station to view Live Data', 'Warning!');
    }else{
      this.layout.page = name;
      this.layout.page = name;
      console.log(this.layout.page);
      if(this.layout.page === 'logout'){
  this.router.navigate(['/login']);
      }
    }
     
  }
}
