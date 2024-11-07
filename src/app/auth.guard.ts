import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const loginTime = localStorage.getItem('loginTime');
console.log("loginTime :" ,loginTime);
    if (loginTime) {
      const elapsedTime = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60); // Convert ms to hours
      if (elapsedTime < 10) {
        console.log("loggeed == ",true);
        return true; // User is logged in and session is valid
      }
    }

    // Session is expired or user is not logged in
    localStorage.removeItem('loginTime');
    this.router.navigate(['/login']);
    console.log("loggeed == ",false);
    return false;
  }
}