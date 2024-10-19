import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.css'
})
export class HealthComponent {

  sensorStatus = [
    { name: 'Tide', status: 'Progress', time: "04.13", date: "16/10/2024", file:'tide'},
    { name: 'Current', status: 'Recieved' , time: "04.23", date: "16/10/2024", file:'Current-Low'},
   
    { name: 'Battery', status: 'Progress' , time:"04.13", date: "16/10/2024", file:'Battery'},
  ];

}
