import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userName: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login(event: Event) {
    event.preventDefault(); // Prevent the default form submission

    const user = {
      userName: this.userName,
      password: this.password,
    };

    console.log(user);

    this.http.post('http://localhost:3000/api/users/login', user).subscribe({
      next: (response) => {
        console.log(response);
        // Navigate to the base route upon successful login
        this.router.navigate(['/base']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        // Handle error (e.g., show an error message)
      },
    });
  }
}
