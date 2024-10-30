import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { ConfigDataService } from '../config-data.service';
import { SensorData } from '../../model/config.model';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.css'
})
export class HealthComponent {

  sensorStatus = [
    { name: 'Tide', status: 'Progress', time: "14:13", date: "21/10/2024", file:'tide'},
    { name: 'Current', status: 'Recieved' , time: "14:23", date: "21/10/2024", file:'Current-Low'},
   
    { name: 'Battery', status: 'Recieved' , time:"14:23", date: "21/10/2024", file:'Battery'},
  ];
  sensorDatelist: SensorData[] = []; // Holds fetched sensor data

  ngOnInit(): void {
    this.fetchSensorData();
  }
constructor(private layout:LayoutComponent, private data:ConfigDataService){}
  fetchSensorData(): void {
    this.data.getSensorLiveData('2024-01-01', '2024-10-25').subscribe(datat => {
      if (this.layout.selectedBuoy === 'CWPRS01') {
        this.sensorDatelist = datat.buoy1;
      } else if (this.layout.selectedBuoy === 'CWPRS02') {
        this.sensorDatelist = datat.buoy2;
      }

      // Call update function after data is fetched
      this.updateSensorStatus(this.sensorDatelist);
      console.log("Sensor Data List: ", this.sensorDatelist);
    });
  }

  updateSensorStatus(data: SensorData[]): void {
    if (data.length === 0) return; // Return if no data

    const firstRow = data[0];
    console.log("row",firstRow.Date);
    
    

    // Check if all required data is available for each sensor in the first row
    const tideReceived = firstRow.S1_RelativeWaterLevel !== null;
    const currentReceived = firstRow.Lower_CurrentSpeedDirection !== null &&
                            firstRow.Middle_CurrentSpeedDirection !== null &&
                            firstRow.S2_SurfaceCurrentSpeedDirection !== null;
    const batteryReceived = firstRow.Battery_Voltage!== null;

    // Update the status and date/time based on data availability
    this.sensorStatus[0].status = tideReceived ? "Recieved" : "Progress";
    this.sensorStatus[1].status = currentReceived ? "Recieved" : "Progress";
    this.sensorStatus[2].status = batteryReceived ? "Recieved" : "Progress";


    if(tideReceived){
      this.sensorStatus[0].date = this.formatDate(this.sensorDatelist[0].Date);
      this.sensorStatus[0].time = this.formatTime(this.sensorDatelist[0].Time);
    }else{
      this.sensorStatus[0].date = this.formatDate(this.sensorDatelist[1].Date);
      this.sensorStatus[0].time = this.formatTime(this.sensorDatelist[1].Time);
    }

    if(currentReceived){
      this.sensorStatus[1].date = this.formatDate(this.sensorDatelist[0].Date);
      this.sensorStatus[1].time = this.formatTime(this.sensorDatelist[0].Time);
    }else{
      this.sensorStatus[1].date = this.formatDate(this.sensorDatelist[1].Date);
      this.sensorStatus[1].time = this.formatTime(this.sensorDatelist[1].Time);
    }

    if(batteryReceived){
      this.sensorStatus[2].date = this.formatDate(this.sensorDatelist[0].Date);
      this.sensorStatus[2].time = this.formatTime(this.sensorDatelist[0].Time);
    }else{
      this.sensorStatus[2].date = this.formatDate(this.sensorDatelist[1].Date);
      this.sensorStatus[2].time = this.formatTime(this.sensorDatelist[1].Time);
    }

    // if (tideReceived && currentReceived && batteryReceived) {
      
    //   // If all data is received, set the date and time to the current row
    //   this.sensorStatus.forEach(sensor => {
    //     sensor.date = date;
    //     sensor.time = time;
    //   });
    // } else {
    //   // If any data is missing, set date and time to last valid date/time
      
    //     this.sensorStatus[0].date = date;
    //     this.sensorStatus[0].time = time;
      
    // }
  }

  formatDate(date:string):string{
    const d = date;
    const dd = new Date(d);
    const datee = dd.toISOString().substr(0,10);
    return datee;
  }

  formatTime(time:string):string{
    const t = time;
    const tt = new Date(t);
    const timee  = tt.toISOString().substr(11,8);
    return timee;
  }

}
// const hours = tt.getHours().toString().padStart(2, '0'); // Ensure two digits
// const minutes = tt.getMinutes().toString().padStart(2, '0'); // Ensure two digits
// return `${hours}:${minutes}`;
