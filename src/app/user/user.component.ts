import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  usersList = [
    { name: "Kavi", role: "Software Developer", position: "Team Lead" },
    { name: "Ganapathi", role: "Software Developer", position: "Team Lead" },
    { name: "Prabu", role: "Software Developer", position: "Team Lead" },
    { name: "Kishore", role: "Software Developer", position: "Team Lead" },
    // { name: "Vasu", role: "Software Developer", position: "Team Lead" },
    // { name: "King", role: "Software Developer", position: "Team Lead" }
  ];
}
