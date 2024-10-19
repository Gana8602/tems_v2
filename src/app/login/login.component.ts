import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule], // Add RouterModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Fix typo from styleUrl to styleUrls
  providers: [AuthService]
})
export class LoginComponent {
  UserObj: any = {
    userName: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    // Directly navigate to the base route without authentication
    this.router.navigate(['/base']);
  }
  
}
