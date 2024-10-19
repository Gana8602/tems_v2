import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { SidenavComponent } from '../sidenav/sidenav.component';
import { HomeComponent } from '../home/home.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ReportsComponent } from '../reports/reports.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { ConfigurationsComponent } from '../configurations/configurations.component';
import { UserComponent } from '../user/user.component';
import { ToastrModule } from 'ngx-toastr';

interface SensorData {
  StationID: string;
  Date: string;
  Time: string;
  LAT: string;
  LONG: string;
  BatteryVoltage: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    HttpClientModule,
    RouterModule, // Import RouterModule here
    SidenavComponent,
    HomeComponent,
    DashboardComponent,
    ReportsComponent,
    AnalyticsComponent,
    ConfigurationsComponent,
    UserComponent,
    ToastrModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'] // Fix typo from styleUrl to styleUrls
})
export class LayoutComponent implements OnInit {
  sensorDataList: SensorData[] = [];
  httpClient = inject(HttpClient);
  page:String = 'Home';

  ngOnInit(): void {
    this.sensors();
  }

  sensors() {
    this.httpClient.get('http://localhost:3000/api/users/sensorData')
      .subscribe((data: any) => {
        this.sensorDataList = data;
      });
  }
}
