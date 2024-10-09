import { Component, inject, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { HomeComponent } from '../home/home.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ReportsComponent } from '../reports/reports.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { routes } from '../app.routes';
import { Router, RouterModule } from '@angular/router';
import { ConfigurationsComponent } from '../configurations/configurations.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SensorService } from '../sensor.service';

interface SensorData {
  StationID: string;
  Date: string;
  Time: string;
  UTC_Time: string;
  LAT: string;
  LONG: string;
  BatteryVoltage: string;
  GPS_Date: string;
  S1_RelativeWaterLevel: string;
  S2_Bin1_Surface: string;
  S2_Bin4_Middle: string;
  S2_Bin7_Lower: string;
}
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HttpClientModule, RouterModule, SidenavComponent, HomeComponent, DashboardComponent, ReportsComponent, AnalyticsComponent, ConfigurationsComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  sensorDataList: SensorData[] = [];
  httpClient = inject(HttpClient);

  ngOnInit(): void {
    this.sensors();
  }
  page:String ="home";
//  constructor(private sensor: SensorService) {}

sensors(){
  console.log('started');
  this.httpClient.get('http://localhost:3000/api/users/sensorData')
  .subscribe((data:any)=>{
    console.log(data);
    this.sensorDataList = data;
    console.log(this.sensorDataList[this.sensorDataList.length -1]);
    console.log(this.sensorDataList[0]?.StationID);
  })
}
// ngOnInit(): void{
//   this.sensors();
// }

}
