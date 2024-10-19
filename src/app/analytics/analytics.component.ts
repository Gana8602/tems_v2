// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    // CommonModule, RouterOutlet, CanvasJSAngularChartsModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements AfterViewInit{

@ViewChild('chart') chartElement!: ElementRef;

ngAfterViewInit(): void {
  const chart = echarts.init(this.chartElement.nativeElement);

  const option = {
    angleAxis: {
      type: 'category',
      data: ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'], // Wind directions
    },
    radiusAxis: {
      max: 40 // Setting the max speed to 40
    },
    polar: {},
    series: [
      {
        type: 'bar',
        data: [12, 15, 20, 25, 30, 18, 24, 10],  // Wind speed data (in degrees or meters per second)
        coordinateSystem: 'polar',
        name: 'Wind Speed',
        stack: 'wind',
        emphasis: {
          focus: 'series'
        }
      }
    ],
    legend: {
      show: true,
      data: ['Wind Speed']
    }
  };

  chart.setOption(option);
}
}    