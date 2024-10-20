import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-battery',
  standalone:true,
  templateUrl: './battery.component.html',
  styleUrls: ['./battery.component.css'],
  imports:[CommonModule],
})
export class BatteryComponent implements OnInit {

  @Input() batteryLevel: number = 30; // Battery level input
  public batteryColor: string = 'green'; // Battery color based on level
  public offset: number = 0;
  public circumference: number = 0;
  

  ngOnInit() {
    this.calculateBatteryColor();
    this.calculateBatteryOffset();
  }

  // Calculate the color of the battery based on its level
  calculateBatteryColor() {
    if (this.batteryLevel > 75) {
      this.batteryColor = 'green';
    } else if (this.batteryLevel > 40) {
      this.batteryColor = 'yellow';
    } else {
      this.batteryColor = 'red';
    }
  }

  // Calculate the stroke offset for the circular battery indicator
  calculateBatteryOffset() {
    const radius = 45; // Radius of the circle
    this.circumference = 2 * Math.PI * radius; // Circumference of the circle
    this.offset = this.circumference - (this.batteryLevel / 100) * this.circumference; // Stroke offset calculation
  }
}
