import { Component } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions } from 'ag-charts-community';
import {  NgCircleProgressModule } from 'ng-circle-progress';
import { GoogleChartsModule } from 'angular-google-charts';
import { ChartType } from 'angular-google-charts';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AgCharts, NgCircleProgressModule, GoogleChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  public gaugeChart = {
    title: 'Speedometer',
    type: ChartType.Gauge,
    data: [
      ['Label', 'Value'],
      ['Speed', 80], // Ensure this is a number
    ],
    options: {
      width: 400,
      height: 200,
      redFrom: 90,
      redTo: 100,
      yellowFrom: 75,
      yellowTo: 90,
      greenFrom: 0,
      greenTo: 75,
      minorTicks: 5,
      max: 100, // Set maximum value for the gauge
    },
  };
  
  // public chartOptions: AgChartOptions;
  // constructor() {
  //   this.chartOptions = {
  //     // Data: Data to be displayed in the chart
  //     data: [
  //       { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
  //       { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
  //       { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
  //       { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
  //       { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
  //       { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
  //     ],
  //     // Series: Defines which chart type and data to use
  //     series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }]
  //   };
  // }
}
