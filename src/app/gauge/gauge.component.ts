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
  value: number = 23;
  speedType: string = 'm/s';

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    const chartDom = document.getElementById(this.gaugeId)!;  // Use dynamic ID
    const myChart = echarts.init(chartDom);
    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 40,
          splitNumber: 5,
          itemStyle: {
            color: '#58D9F9',
            shadowColor: 'rgba(0,138,255,0.45)',
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2
          },
          progress: {
            show: true,
            roundCap: true,
            width: 8
          },
          pointer: {
            length: '75%',
            width: 6,
            offsetCenter: [0, '5%']
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 4
            }
          },
          axisTick: {
            splitNumber: 3,
            lineStyle: {
              width: 1,
              color: '#999'
            }
          },
          splitLine: {
            length: 10,
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          axisLabel: {
            distance: -35,
            color: '#999',
            fontSize: 10
          },
          title: {
            show: false
          },
          detail: {
            width: '50%',
            lineHeight: 40,
            height: 40,
            borderRadius: 8,
            offsetCenter: [0, '25%'],
            valueAnimation: true,
            formatter: (value: number) => {
              return `{value|${value.toFixed(0)}}{unit| ${this.speedType}}`;
            },
            rich: {
              value: {
                fontSize: 20,
                fontWeight: 'bolder',
                color: '#ffff'
              },
              unit: {
                fontSize: 20,
                color: '#ffff',
                padding: [0, 0, -20, 10]
              }
            }
          },
          data: [
            {
              value: this.value
            }
          ]
        }
      ]
    };
    myChart.setOption(option);
  }
}
