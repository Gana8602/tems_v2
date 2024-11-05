import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CurrentUser } from '../../model/config.model';
import { ConfigDataService } from '../config-data.service';
import { response } from 'express';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[ConfigDataService]
})
export class LoginComponent {
  userName: string = '';
  password: string = '';
  currentUser!:CurrentUser;
  constructor(private http: HttpClient, private router: Router, private toast:ToastrService, private config:ConfigDataService) {}

  login(event: Event) {
    event.preventDefault(); // Prevent the default form submission

    const user = {
      userName: this.userName,
      password: this.password,
    };

    console.log(user);
    this.config.login(user).subscribe(response=>{
      this.currentUser = response;
      console.log(this.currentUser.email);
      this.router.navigate(['/base']);
      this.toast.success("Logged in Succesfully", 'Access Granted ')
    })
//     this.http.post('http://192.168.0.100:3000/api/users/login', user).subscribe({
//       next: (response) => {
//         console.log(response);
//         // Navigate to the base route upon successful login
//         // this.currentUser = response;
//         this.router.navigate(['/base']);
//         this.toast.success("Logged in Succesfully", 'Access Granted ')
//       },
//       error: (err) => {
//         console.error('Login failed:', err);
// this.toast.error('Enter Correct Username and password', "Login Failed")
//         // Handle error (e.g., show an error message)
//       },
//     });
  }
}
