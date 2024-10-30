import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';
import { Config } from '../../model/config.model';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-gauge',
  standalone:true,
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements AfterViewInit, OnChanges {
  @Input() gaugeId!: string;  // Dynamically assigned ID
  @Input() value!: number;
  speedType: string = '';
  

  constructor(private lay:LayoutComponent){}
  ngAfterViewInit(): void {
    this.data();
    this.initChart();
  }
data(){
this.speedType = this.lay.configs[1].unit;
console.log(this.speedType);
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.initChart();
    }
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
          min: 0,
          max: 4,
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
              return `${value.toFixed(2)} ${this.speedType}`;  // Use value for the gauge
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
