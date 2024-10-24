import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-battery',
  standalone: true,
  templateUrl: './battery.component.html',
  styleUrls: ['./battery.component.css'],
  imports: [CommonModule],
})
export class BatteryComponent implements OnInit {
  @Input() batteryLevel: number = 12.4; // Default battery level in volts
  public batteryColor: string = 'green'; // Battery color based on level
  public fillHeight: string = '0%'; // To dynamically set battery fill height

  ngOnInit() {
    this.calculateBatteryColor();
    this.calculateBatteryFill();
  }

  // Calculate the color of the battery based on its level
  calculateBatteryColor() {
    if (this.batteryLevel > 12.0) {
      this.batteryColor = 'green'; // Full charge
    } else if (this.batteryLevel < 9.0) {
      this.batteryColor = 'yellow'; // Moderate charge
    } else if(this.batteryLevel <5) {
      this.batteryColor = 'red'; // Low charge
    }
  }

  // Calculate the height of the battery fill based on the voltage
  calculateBatteryFill() {
    const maxLevel = 12.4; // Set your maximum level
    const minLevel = 0; // Below which it's considered low
    const fillPercentage = ((this.batteryLevel - minLevel) / (maxLevel - minLevel)) * 100;

    // Ensure fillPercentage is between 0% and 100%
    this.fillHeight = fillPercentage > 100 ? '100%' : fillPercentage < 0 ? '0%' : fillPercentage + '%';
  }
}
