import { Component, Input, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';
 
@Component({
  selector: 'app-gauge',
  standalone:true,
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
 
export class GaugeComponent implements AfterViewInit {
  @Input() gaugeId!: string;  // Dynamically assigned ID
  @Input() value!: number;
  speedType: string = 'Knots';
  
 
  ngAfterViewInit(): void {
    this.initChart();
  }
  getColorForValue(value: number): string {
    if (value >= 0 && value < 12) {
      return '#008000';  // Light blue for 0-12
    } else if (value >= 12 && value < 28) {
      return '#37a2da';  // Blue for 12-28
    } else {
      return '#fd666d';  // Red for above 28
    }
  }
  initChart(): void {
    const chartDom = document.getElementById(this.gaugeId)!;  // Use dynamic ID
    const myChart = echarts.init(chartDom);
    const valueColor = this.getColorForValue(this.value);
    const option = {
      series: [
        {
          type: 'gauge',
          min:0,
          max: 40,
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.3, '#008000'],
                [0.7, '#37a2da'],
                [1, '#fd666d']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: valueColor
            }
          },
          axisTick: {
            distance: -9,
            length: 9,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -10,
            length: 11,
            lineStyle: {
              color: '#fff',
              width: 4
            }
          },
          axisLabel: {
            color: 'inherit',
            distance: 15,
            fontSize: 10
          },
          detail: {
            valueAnimation: true,
            formatter: (value: number) => {
              return `${this.value.toFixed(0)} ${this.speedType}`;  // Dynamic value with speedType unit
            },
            color: valueColor,
            fontSize: 18
          },
          data: [
            {
              value: this.value
              
            },
            
          ]
        }
      ]
    };
    myChart.setOption(option);
  }
}
 